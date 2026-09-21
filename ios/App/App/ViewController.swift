import UIKit
import Capacitor
import Darwin

class ViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        #if targetEnvironment(macCatalyst)
        configureMacWindow()
        #endif
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        #if targetEnvironment(macCatalyst)
        configureMacWindow()
        for delay in [0.05, 0.1, 0.2, 0.3, 0.5, 1.0, 2.0] {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
                self?.configureMacWindow()
            }
        }
        #endif
    }

    #if targetEnvironment(macCatalyst)
    private func configureMacWindow() {
        // 1. UIKit WindowScene configuration
        if let windowScene = self.view.window?.windowScene {
            windowScene.title = ""
            if let titlebar = windowScene.titlebar {
                titlebar.titleVisibility = .hidden
                titlebar.toolbar = nil
                if #available(iOS 14.0, *) {
                    titlebar.separatorStyle = .none
                }
            }
        }
        
        for scene in UIApplication.shared.connectedScenes {
            if let ws = scene as? UIWindowScene {
                ws.title = ""
                if let titlebar = ws.titlebar {
                    titlebar.titleVisibility = .hidden
                    titlebar.toolbar = nil
                    if #available(iOS 14.0, *) {
                        titlebar.separatorStyle = .none
                    }
                }
            }
        }

        // 2. Load AppKit framework dynamically if not already loaded
        _ = dlopen("/System/Library/Frameworks/AppKit.framework/AppKit", RTLD_NOW)

        // 3. Configure through NSApplication.sharedApplication.windows
        if let nsAppClass = NSClassFromString("NSApplication") as? NSObject.Type,
           let sharedApp = nsAppClass.perform(NSSelectorFromString("sharedApplication"))?.takeUnretainedValue() as? NSObject,
           let windows = sharedApp.value(forKey: "windows") as? [NSObject] {
            for win in windows {
                applyNSWindowSettings(win: win)
            }
        }
        
        // 4. Also try directly via UIWindow's underlying NSWindow
        if let uiWin = self.view.window {
            if let hostWin = (uiWin as AnyObject).value(forKey: "_hostWindow") as? NSObject {
                applyNSWindowSettings(win: hostWin)
            }
            if let nsWin = (uiWin as AnyObject).value(forKey: "nsWindow") as? NSObject {
                applyNSWindowSettings(win: nsWin)
            }
        }
    }

    private func applyNSWindowSettings(win: NSObject) {
        // Clear title and make titlebar transparent
        win.setValue("", forKey: "title")
        win.setValue(true, forKey: "titlebarAppearsTransparent")
        win.setValue(1, forKey: "titleVisibility") // 1 = NSWindowTitleHidden
        
        // Completely destroy/remove toolbar
        _ = win.perform(NSSelectorFromString("setToolbar:"), with: nil)
        win.setValue(nil, forKey: "toolbar")
        win.setValue([], forKey: "titlebarAccessoryViewControllers")
        
        // Set fullSizeContentView mask so webview occupies (0, 0)
        if let currentMask = win.value(forKey: "styleMask") as? UInt {
            let fullSizeMask: UInt = 1 << 15
            if (currentMask & fullSizeMask) == 0 {
                win.setValue(currentMask | fullSizeMask, forKey: "styleMask")
            }
        }
        
        // Hide any residual toolbar or vibrancy effect subviews in the theme frame
        if let contentView = win.value(forKey: "contentView") as? NSObject {
            contentView.setValue(true, forKey: "wantsLayer")
            if let themeFrame = contentView.value(forKey: "superview") as? NSObject,
               let subviews = themeFrame.value(forKey: "subviews") as? [NSObject] {
                for subview in subviews {
                    let className = NSStringFromClass(type(of: subview))
                    if className.contains("Toolbar") || className.contains("VisualEffect") {
                        subview.setValue(0.0, forKey: "alphaValue")
                        subview.setValue(true, forKey: "isHidden")
                    }
                }
            }
        }
    }
    #endif
}
