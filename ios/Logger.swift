//
//  Logger.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 04/06/2021.
//

import Foundation
import React


class Logger {
    let queue = DispatchQueue(label: "logQueue")
    
    var isEnabled: Bool = true

    func writeLog(
        _ message: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queue.async {
            let m = "\(message)\n"
            let data = m.data(using: .utf8)!
            
            let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).last! as URL
            let url = dir.appendingPathComponent("log.text")
            
            try! data.append(fileURL: url)
            resolver("")
        }
    }

    func getAllLogs(
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queue.async {
            let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).last! as URL
            let url = dir.appendingPathComponent("log.text")
            guard let data = try? Data(contentsOf: url) else {
                return rejecter("100", "ErrorFetchDataFromFile", nil)
            }
            
            guard let string = String(data: data, encoding: .utf8) else {
                return rejecter("101", "ErrorParseDataToString", nil)
            }
            
            resolver(string)
        }
    }
}

extension Data {
    func append(fileURL: URL) throws {
        if let fileHandle = FileHandle(forWritingAtPath: fileURL.path) {
            defer {
                fileHandle.closeFile()
            }
            fileHandle.seekToEndOfFile()
            fileHandle.write(self)
        }
        else {
            try write(to: fileURL, options: .atomic)
        }
    }
}
