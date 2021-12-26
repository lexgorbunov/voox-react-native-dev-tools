//
//  Utils.swift
//  DevTools
//
//  Created by Sergei Golishnikov on 11/12/2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation

var topPresentingController: UIViewController {
    return UIApplication.shared.keyWindow!.rootViewController!.topViewController()
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
}

func prepareScreenshotAndLogFile(
    screenshot: UIImage?,
    summary: String,
    resolve: RCTPromiseResolveBlock?
) {
    DispatchQueue.global(qos: .utility).async {
        var screenshotFilePath: String? = nil

        if let screenshot = screenshot {
            let cacheDir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first!
            let screenhotUrl = cacheDir.appendingPathComponent("screenshot.jpg")
            let screenshotFile = screenhotUrl.absoluteString.replacingOccurrences(of: "file:///", with: "/")
            let didCreate = FileManager.default.createFile(
                atPath: screenshotFile,
                contents: screenshot.jpegData(compressionQuality: 1),
                attributes: nil
            )
            if didCreate { screenshotFilePath = screenshotFile }
        }

        resolve?([
            "summary": summary,
            "screenshotPath": screenshotFilePath
        ])
    }
}
