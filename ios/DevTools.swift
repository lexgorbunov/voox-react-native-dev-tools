import UIKit
import React

@objc(DevTools)
class DevTools: RCTEventEmitter {
    var shake: RNShakeEvent?
    
    override class func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    override func supportedEvents() -> [String]! {
        return ["DevToolsData"]
    }
    
    @objc
    private func didShake() {
        sendEvent(withName: "DevToolsData", body: [])
    }
    
    @objc
    func enableShaker(_ enabled: Bool) {
        shake = nil
        NotificationCenter.default.removeObserver(self, name: .init(rawValue: "shakeDetected"), object: nil)
        if enabled {
            shake = RNShakeEvent()
            NotificationCenter.default.addObserver(self, selector: #selector(didShake), name: .init(rawValue: "shakeDetected"), object: nil)
        }
    }
    
    @objc
    func presentDevTools(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        DevToolsViewController.presentDevController(resolve)
    }

    @objc
    func screenshot(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            let layer = UIApplication.shared.keyWindow!.layer
            let scale = UIScreen.main.scale
            // Creates UIImage of same size as view
            UIGraphicsBeginImageContextWithOptions(layer.frame.size, false, scale);
            layer.render(in: UIGraphicsGetCurrentContext()!)
            let screenshot = UIGraphicsGetImageFromCurrentImageContext()
            UIGraphicsEndImageContext()
            DispatchQueue.global(qos: .utility).async {
                let imageData = screenshot!.pngData()
                resolve(imageData!.base64EncodedString())
            }
        }
    }
}
