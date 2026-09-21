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
        configureMacCatalystWindow()
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
        for scene in UIApplication.shared.connectedScenes {
            if let windowScene = scene as? UIWindowScene {
                windowScene.titlebar?.titleVisibility = .hidden
                windowScene.titlebar?.toolbar = nil
                if #available(iOS 14.0, *) {
                    windowScene.titlebar?.separatorStyle = .none
                }
            }
        }
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
