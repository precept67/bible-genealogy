import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 1. Setup iCloud Sync Observers and Bridge
        setupICloudSync()

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
            UIScene.didActivateNotification
        ]
        for notif in sceneNotifications {
            NotificationCenter.default.addObserver(forName: notif, object: nil, queue: .main) { [weak self] _ in
                self?.configureMacCatalystWindow()
            }
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.configureMacCatalystWindow()
        }
        #endif
        return true
    }

    // ==========================================
    // Native iCloud Sync Setup & Observers
    // ==========================================
    private func setupICloudSync() {
        // Observe external iCloud changes (from iPhone <-> iPad <-> Mac)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(iCloudDidChangeExternally(_:)),
            name: NSUbiquitousKeyValueStore.didChangeExternallyNotification,
            object: NSUbiquitousKeyValueStore.default
        )
        
        // Synchronize on startup
        NSUbiquitousKeyValueStore.default.synchronize()

        // Attach message handlers across startup lifecycle
        for delay in [0.2, 0.6, 1.2, 2.5] {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
                self?.attachScriptMessageHandlers()
            }
        }
    }

    private func getBridgeWebView() -> WKWebView? {
        if let bridgeVC = self.window?.rootViewController as? CAPBridgeViewController {
            return bridgeVC.webView
        }
        for scene in UIApplication.shared.connectedScenes {
            if let windowScene = scene as? UIWindowScene {
                for win in windowScene.windows {
                    if let bridgeVC = win.rootViewController as? CAPBridgeViewController {
                        return bridgeVC.webView
                    }
                }
            }
        }
        for window in UIApplication.shared.windows {
            if let bridgeVC = window.rootViewController as? CAPBridgeViewController {
                return bridgeVC.webView
            }
        }
        return nil
    }

    private func attachScriptMessageHandlers() {
        guard let webView = getBridgeWebView() else { return }
        
        let ucc = webView.configuration.userContentController
        ucc.removeScriptMessageHandler(forName: "iCloudSync")
        ucc.add(self, name: "iCloudSync")
        
        #if targetEnvironment(macCatalyst)
        ucc.removeScriptMessageHandler(forName: "macWindowControl")
        ucc.add(self, name: "macWindowControl")
        #endif
    }

    @objc private func iCloudDidChangeExternally(_ notification: Notification) {
        let reason = notification.userInfo?[NSUbiquitousKeyValueStoreChangeReasonKey] as? Int ?? -1
        let changedKeys = notification.userInfo?[NSUbiquitousKeyValueStoreChangedKeysKey] as? [String] ?? []
        
        var dataDict = [String: Any]()
        for (k, v) in NSUbiquitousKeyValueStore.default.dictionaryRepresentation {
            dataDict[k] = v
        }
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: [
            "reason": reason,
            "changedKeys": changedKeys,
            "data": dataDict,
            "timestamp": Date().timeIntervalSince1970 * 1000
        ], options: []),
        let jsonStr = String(data: jsonData, encoding: .utf8) else { return }
        
        DispatchQueue.main.async { [weak self] in
            guard let webView = self?.getBridgeWebView() else { return }
            let js = """
            (function() {
                try {
                    const evtDetail = \(jsonStr);
                    window.dispatchEvent(new CustomEvent('iCloudDataChangedExternally', { detail: evtDetail }));
                    if (typeof window.__onICloudExternalChange === 'function') {
                        window.__onICloudExternalChange(evtDetail);
                    }
                } catch(e) { console.error('iCloud event dispatch error:', e); }
            })();
            """
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Synchronize iCloud store when returning to foreground
        NSUbiquitousKeyValueStore.default.synchronize()
        
        #if targetEnvironment(macCatalyst)
        configureMacCatalystWindow()
        #endif
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
            let targetVC = self.getBridgeWebView()
            let js = "window.setMacCatalystFullscreen && window.setMacCatalystFullscreen(\(isFullscreen ? "true" : "false"));"
            targetVC?.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    private func configureMacCatalystWindow() {
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
        attachScriptMessageHandlers()
    }
    #endif

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    // MARK: UISceneSession Lifecycle
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

// ==========================================
// Native WKScriptMessageHandler for iCloud & Mac Controls
// ==========================================
extension AppDelegate: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "iCloudSync" {
            handleICloudMessage(message)
            return
        }
        
        #if targetEnvironment(macCatalyst)
        if message.name == "macWindowControl", let action = message.body as? String {
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
        #endif
    }

    private func handleICloudMessage(_ message: WKScriptMessage) {
        guard let dict = message.body as? [String: Any],
              let callId = dict["id"] as? String,
              let action = dict["action"] as? String else { return }

        let store = NSUbiquitousKeyValueStore.default

        switch action {
        case "isAvailable":
            replyToJS(callId: callId, success: true, result: ["available": true])

        case "get":
            if let key = dict["key"] as? String {
                let value = store.string(forKey: key)
                replyToJS(callId: callId, success: true, result: ["key": key, "value": value as Any])
            } else {
                replyToJS(callId: callId, success: false, error: "Missing key")
            }

        case "set":
            if let key = dict["key"] as? String, let value = dict["value"] as? String {
                store.set(value, forKey: key)
                let syncRes = store.synchronize()
                replyToJS(callId: callId, success: true, result: ["key": key, "synced": syncRes])
            } else {
                replyToJS(callId: callId, success: false, error: "Missing key or value")
            }

        case "remove":
            if let key = dict["key"] as? String {
                store.removeObject(forKey: key)
                let syncRes = store.synchronize()
                replyToJS(callId: callId, success: true, result: ["key": key, "synced": syncRes])
            } else {
                replyToJS(callId: callId, success: false, error: "Missing key")
            }

        case "getAll":
            var allData = [String: Any]()
            for (k, v) in store.dictionaryRepresentation {
                allData[k] = v
            }
            replyToJS(callId: callId, success: true, result: ["data": allData])

        case "setAll":
            if let data = dict["data"] as? [String: Any] {
                for (k, v) in data {
                    if let strVal = v as? String {
                        store.set(strVal, forKey: k)
                    } else if let numVal = v as? NSNumber {
                        store.set(numVal, forKey: k)
                    } else if let dictVal = v as? [String: Any],
                              let jsonData = try? JSONSerialization.data(withJSONObject: dictVal, options: []),
                              let jsonStr = String(data: jsonData, encoding: .utf8) {
                        store.set(jsonStr, forKey: k)
                    } else if let arrVal = v as? [Any],
                              let jsonData = try? JSONSerialization.data(withJSONObject: arrVal, options: []),
                              let jsonStr = String(data: jsonData, encoding: .utf8) {
                        store.set(jsonStr, forKey: k)
                    }
                }
                let syncRes = store.synchronize()
                replyToJS(callId: callId, success: true, result: ["synced": syncRes])
            } else {
                replyToJS(callId: callId, success: false, error: "Missing data payload")
            }

        case "synchronize":
            let res = store.synchronize()
            replyToJS(callId: callId, success: true, result: ["synced": res])

        case "saveFile":
            // Save payload to iCloud Documents Ubiquity Container file
            if let content = dict["content"] as? String,
               let filename = dict["filename"] as? String {
                DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                    let saved = self?.saveToUbiquityContainer(filename: filename, content: content) ?? false
                    self?.replyToJS(callId: callId, success: saved, result: ["saved": saved])
                }
            } else {
                replyToJS(callId: callId, success: false, error: "Missing content or filename")
            }

        case "readFile":
            if let filename = dict["filename"] as? String {
                DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                    let content = self?.readFromUbiquityContainer(filename: filename)
                    if let content = content {
                        self?.replyToJS(callId: callId, success: true, result: ["content": content])
                    } else {
                        self?.replyToJS(callId: callId, success: false, error: "File not found or unreadable")
                    }
                }
            } else {
                replyToJS(callId: callId, success: false, error: "Missing filename")
            }

        default:
            replyToJS(callId: callId, success: false, error: "Unknown action: \(action)")
        }
    }

    private func saveToUbiquityContainer(filename: String, content: String) -> Bool {
        guard let containerURL = FileManager.default.url(forUbiquityContainerIdentifier: nil) else {
            // Fallback to local Documents directory
            guard let docURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else { return false }
            let fileURL = docURL.appendingPathComponent(filename)
            try? content.write(to: fileURL, atomically: true, encoding: .utf8)
            return true
        }
        let docURL = containerURL.appendingPathComponent("Documents")
        try? FileManager.default.createDirectory(at: docURL, withIntermediateDirectories: true, attributes: nil)
        let fileURL = docURL.appendingPathComponent(filename)
        do {
            try content.write(to: fileURL, atomically: true, encoding: .utf8)
            return true
        } catch {
            print("Ubiquity save error:", error)
            return false
        }
    }

    private func readFromUbiquityContainer(filename: String) -> String? {
        if let containerURL = FileManager.default.url(forUbiquityContainerIdentifier: nil) {
            let fileURL = containerURL.appendingPathComponent("Documents").appendingPathComponent(filename)
            if FileManager.default.fileExists(atPath: fileURL.path),
               let content = try? String(contentsOf: fileURL, encoding: .utf8) {
                return content
            }
        }
        if let docURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            let fileURL = docURL.appendingPathComponent(filename)
            if FileManager.default.fileExists(atPath: fileURL.path),
               let content = try? String(contentsOf: fileURL, encoding: .utf8) {
                return content
            }
        }
        return nil
    }

    private func replyToJS(callId: String, success: Bool, result: [String: Any]? = nil, error: String? = nil) {
        var replyDict: [String: Any] = ["id": callId, "success": success]
        if let result = result { replyDict["result"] = result }
        if let error = error { replyDict["error"] = error }
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: replyDict, options: []),
              let jsonStr = String(data: jsonData, encoding: .utf8) else { return }
        
        DispatchQueue.main.async { [weak self] in
            guard let webView = self?.getBridgeWebView() else { return }
            let js = """
            (function() {
                if (window.__iCloudCallbacks && window.__iCloudCallbacks['\(callId)']) {
                    window.__iCloudCallbacks['\(callId)'](\(success ? "true" : "false"), \(jsonStr));
                }
            })();
            """
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }
}
