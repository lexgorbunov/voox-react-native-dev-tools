//
//  DevToolsViewController.swift
//  DevTools
//
//  Created by Sergei Golishnikov on 09/12/2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation
import UIKit


var topPresentingController: UIViewController {
    return UIApplication.shared.keyWindow!.rootViewController!.topViewController()
}


class DevToolsViewController: UIViewController {
    
    var previewScreenShot: UIImageView = {
        let view = UIImageView()
        view.contentMode = .center
        view.clipsToBounds = true
        return view
    }()
    
    lazy var sendDataButton: UIButton = {
        let view = UIButton()
        view.setTitle("Send data", for: .normal)
        view.setTitleColor(.black, for: .normal)
        view.addTarget(self, action: #selector(editTapped), for: .touchUpInside)
        return view
    }()
    
    static var screenShot: UIImage?
    static var resolve: RCTPromiseResolveBlock?
    static var didResolveUse = false
    
    static func presentDevController(
        _ resolve: @escaping RCTPromiseResolveBlock
    ) {
        Self.didResolveUse = false
        Self.resolve = resolve
        DispatchQueue.main.async {
            Self.screenShot = createScreenshot()
            
            let controller = DevToolsViewController()
            controller.modalPresentationStyle = .formSheet
            topPresentingController.present(controller, animated: true)
        }
    }
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        view.addSubview(previewScreenShot)
        previewScreenShot.image = Self.screenShot

        view.addSubview(sendDataButton)
    }
    
    
    @objc
    func editTapped() {
        debugPrint("send data")
        Self.didResolveUse = true
        Self.resolve?("send")
        self.dismiss(animated: true)
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewScreenShot.frame = .init(x: 0, y: 0, width: view.frame.width * 0.5, height: view.frame.height * 0.5)
        sendDataButton.frame = .init(x: 0, y: view.frame.height / 2 + 10, width: view.frame.width, height: 56)
    }
    
    deinit {
        debugPrint("Deinit")
        if !Self.didResolveUse { Self.resolve?(nil) }
        Self.screenShot = nil
        Self.resolve = nil
    }
}



extension UIViewController {
    
    func topViewController() -> UIViewController {
        topViewController(rootViewController: self)
    }
    
    func topViewController(rootViewController: UIViewController) -> UIViewController {
        
        guard let pvc = rootViewController.presentedViewController else {
            return rootViewController
        }
        
        if let nvc = pvc as? UINavigationController {
            return topViewController(rootViewController: nvc.topViewController!)
        }
        
        return topViewController(rootViewController: pvc)
    }
}

func createScreenshot() -> UIImage {
    let layer = UIApplication.shared.keyWindow!.layer
    let scale = UIScreen.main.scale
    // Creates UIImage of same size as view
    UIGraphicsBeginImageContextWithOptions(layer.frame.size, false, scale);
    layer.render(in: UIGraphicsGetCurrentContext()!)
    let screenshot = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return screenshot!
//    DispatchQueue.global(qos: .utility).async {
//        let imageData = screenshot!.pngData()
//        resolve(imageData!.base64EncodedString())
//    }
}
