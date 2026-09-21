import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        #if targetEnvironment(macCatalyst)
        let enterNotifications = [
            NSNotification.Name("NSWindowDidEnterFullScreenNotification"),
            NSNotification.Name("NSWindowWillEnterFullScreenNotification")
        ]
        for notif in enterNotifications {
            NotificationCenter.default.addObserver(forName: notif, object: nil, queue: .main) { [weak self] _ in
                self?.notifyFullscreenState(isFullscreen: true)
            }
        }
        
        let exitNotifications = [
            NSNotification.Name("NSWindowDidExitFullScreenNotification"),
            NSNotification.Name("NSWindowWillExitFullScreenNotification")
        ]
        for notif in exitNotifications {
            NotificationCenter.default.addObserver(forName: notif, object: nil, queue: .main) { [weak self] _ in
                self?.notifyFullscreenState(isFullscreen: false)
            }
        }

        let sceneNotifications = [
            UIApplication.didBecomeActiveNotification,
            UIWindow.didBecomeKeyNotification,
            UIWindow.didBecomeVisibleNotification,
            UIScene.willConnectNotification,
            UIScene.didActivateNotification,
            NSNotification.Name("NSWindowDidUpdateNotification"),
            NSNotification.Name("NSWindowDidResizeNotification")
        ]
        for notif in sceneNotifications {
            NotificationCenter.default.addObserver(forName: notif, object: nil, queue: .main) { [weak self] _ in
                self?.configureMacCatalystWindow()
            }
        }
        
        configureMacCatalystWindow()
        for delay in [0.01, 0.05, 0.1, 0.2, 0.3, 0.5, 1.0, 2.0, 3.0] {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
                self?.configureMacCatalystWindow()
            }
        }
        
        Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
            self?.configureMacCatalystWindow()
        }
        #endif
        return true
    }

    #if targetEnvironment(macCatalyst)
    private func notifyFullscreenState(isFullscreen: Bool) {
        for scene in UIApplication.shared.connectedScenes {
            if let windowScene = scene as? UIWindowScene {
                windowScene.titlebar?.titleVisibility = .hidden
                windowScene.titlebar?.toolbar = nil
                if #available(iOS 14.0, *) {
                    windowScene.titlebar?.separatorStyle = .none
                }
            }
        }
        DispatchQueue.main.async {
            var targetVC: CAPBridgeViewController? = nil
            if let root = self.window?.rootViewController as? CAPBridgeViewController {
                targetVC = root
            } else if let window = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) ?? UIApplication.shared.windows.first,
                      let root = window.rootViewController as? CAPBridgeViewController {
                targetVC = root
            } else {
                for scene in UIApplication.shared.connectedScenes {
                    if let ws = scene as? UIWindowScene,
                       let win = ws.windows.first(where: { $0.isKeyWindow }) ?? ws.windows.first,
                       let root = win.rootViewController as? CAPBridgeViewController {
                        targetVC = root
                        break
                    }
                }
            }
            let js = "window.setMacCatalystFullscreen && window.setMacCatalystFullscreen(\(isFullscreen ? "true" : "false"));"
            targetVC?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }
    #endif

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        #if targetEnvironment(macCatalyst)
        configureMacCatalystWindow()
        #endif
    }

    #if targetEnvironment(macCatalyst)
    private func configureMacCatalystWindow() {
        // 0. Ensure AppKit framework is loaded into process
        _ = dlopen("/System/Library/Frameworks/AppKit.framework/AppKit", RTLD_NOW)

        // 1. Direct UIKit WindowScene configuration
        self.window?.rootViewController?.title = ""
        for scene in UIApplication.shared.connectedScenes {
            if let windowScene = scene as? UIWindowScene {
                windowScene.title = ""
                windowScene.titlebar?.titleVisibility = .hidden
                windowScene.titlebar?.toolbar = nil
                if #available(iOS 14.0, *) {
                    windowScene.titlebar?.separatorStyle = .none
                }
                for win in windowScene.windows {
                    win.rootViewController?.title = ""
                }
            }
        }

        // 2. Direct AppKit NSWindow runtime manipulation
        if let nsAppClass = NSClassFromString("NSApplication") as? NSObject.Type,
           let sharedApp = nsAppClass.perform(NSSelectorFromString("sharedApplication"))?.takeUnretainedValue() as? NSObject,
           let windows = sharedApp.value(forKey: "windows") as? [NSObject] {
            for win in windows {
                win.setValue("", forKey: "title")
                win.setValue(true, forKey: "titlebarAppearsTransparent")
                win.setValue(1, forKey: "titleVisibility") // NSWindowTitleHidden = 1
                
                // Remove toolbar completely
                _ = win.perform(NSSelectorFromString("setToolbar:"), with: nil)
                win.setValue(nil, forKey: "toolbar")
                win.setValue([], forKey: "titlebarAccessoryViewControllers")
                
                // Set NSWindowStyleMaskFullSizeContentView (1 << 15 = 32768)
                if let currentMask = win.value(forKey: "styleMask") as? UInt {
                    let fullSizeMask: UInt = 1 << 15
                    if (currentMask & fullSizeMask) == 0 {
                        win.setValue(currentMask | fullSizeMask, forKey: "styleMask")
                    }
                }
                
                // Inspect window frame hierarchy to suppress empty toolbar vibrancy layers and titlebar hover shelf
                if let contentView = win.value(forKey: "contentView") as? NSObject {
                    contentView.setValue(true, forKey: "wantsLayer")
                    if let themeFrame = contentView.value(forKey: "superview") as? NSObject {
                        suppressTitlebarHoverEffects(in: themeFrame)
                    }
                }
            }
        }
        attachScriptMessageHandler()
    }

    private func suppressTitlebarHoverEffects(in view: NSObject) {
        let className = NSStringFromClass(type(of: view))
        
        // Remove and suppress visual effects, toolbar, and titlebar container completely from the window
        if className.contains("Titlebar") || className.contains("VisualEffect") || className.contains("Decoration") || className.contains("Toolbar") {
            view.setValue(0.0, forKey: "alphaValue")
            view.setValue(true, forKey: "isHidden")
            if view.responds(to: NSSelectorFromString("setMaterial:")) {
                view.setValue(0, forKey: "material")
            }
            _ = view.perform(NSSelectorFromString("removeFromSuperview"))
            return
        }
        
        // Traverse children
        if let subviews = view.value(forKey: "subviews") as? [NSObject] {
            for subview in subviews {
                suppressTitlebarHoverEffects(in: subview)
            }
        }
    }

    private func attachScriptMessageHandler() {
        var targetVC: CAPBridgeViewController? = nil
        if let root = self.window?.rootViewController as? CAPBridgeViewController {
            targetVC = root
        } else if let window = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) ?? UIApplication.shared.windows.first,
                  let root = window.rootViewController as? CAPBridgeViewController {
            targetVC = root
        }
        targetVC?.webView?.configuration.userContentController.removeScriptMessageHandler(forName: "macWindowControl")
        targetVC?.webView?.configuration.userContentController.add(self, name: "macWindowControl")
    }
    #endif

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

#if targetEnvironment(macCatalyst)
import WebKit

extension AppDelegate: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "macWindowControl", let action = message.body as? String else { return }
        DispatchQueue.main.async {
            if let nsAppClass = NSClassFromString("NSApplication") as? NSObject.Type,
               let sharedApp = nsAppClass.perform(NSSelectorFromString("sharedApplication"))?.takeUnretainedValue() as? NSObject,
               let windows = sharedApp.value(forKey: "windows") as? [NSObject],
               let win = windows.first {
                switch action {
                case "close":
                    _ = win.perform(NSSelectorFromString("performClose:"), with: nil)
                case "minimize":
                    _ = win.perform(NSSelectorFromString("miniaturize:"), with: nil)
                case "zoom", "fullscreen":
                    _ = win.perform(NSSelectorFromString("toggleFullScreen:"), with: nil)
                default:
                    break
                }
            }
        }
    }
}
#endif
