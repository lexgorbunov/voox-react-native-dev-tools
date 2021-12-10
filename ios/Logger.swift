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
    static var logFilePath: URL!
    
    var isEnabled: Bool = true
    
    init() {
        let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).last! as URL
        let url = dir.appendingPathComponent("log.text")
        Self.logFilePath = url
    }

    func writeLog(
        _ message: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queue.async {
            let m = "\(message)\n"
            let data = m.data(using: .utf8)!
            try! data.append(fileURL: Self.logFilePath)
            resolver("")
        }
    }

    func getAllLogs(
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queue.async {
            
            guard let data = try? Data(contentsOf: Self.logFilePath) else {
                return rejecter("100", "ErrorFetchDataFromFile", nil)
            }
            
            guard let string = String(data: data, encoding: .utf8) else {
                return rejecter("101", "ErrorParseDataToString", nil)
            }
            
            resolver(string)
        }
    }
    
    func deleteLogFile(resolver: @escaping RCTPromiseResolveBlock) {
        queue.async {
            do {
                try FileManager.default.removeItem(at: Self.logFilePath)
                resolver(true)
            } catch {
                resolver(false)
            }
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
