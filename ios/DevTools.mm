#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>


#include "DevTools.h"

#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import <React/RCTBridgeModule.h>
#import <ReactCommon/CallInvoker.h>
#import <React/RCTBridge+Private.h>
#import <jsi/jsi.h>
#import <sys/utsname.h>

@interface RCT_EXTERN_MODULE(DevTools, RCTEventEmitter)

RCT_EXTERN_METHOD(screenshot:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(presentDevTools:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(enableShaker:(BOOL)enable)

@end



using namespace facebook;
using namespace std;

@implementation DevToolsModule

@synthesize bridge = _bridge;
@synthesize methodQueue = _methodQueue;
@synthesize logQueue = _logQueue;


RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (void)setBridge:(RCTBridge *)bridge {
    _bridge = bridge;
    _setBridgeOnMainQueue = RCTIsMainQueue();
    _logQueue = dispatch_queue_create("Logueue", NULL);
    [self installLibrary];
}


- (void)installLibrary {
    
    RCTCxxBridge *cxxBridge = (RCTCxxBridge *)self.bridge;
    if (!cxxBridge.runtime) {
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 0.001 * NSEC_PER_SEC),
                       dispatch_get_main_queue(), ^{
            [self installLibrary];
            
        });
        return;
    }
    
    install(*(facebook::jsi::Runtime *)cxxBridge.runtime, self);
}

static void install(jsi::Runtime &jsiRuntime, DevToolsModule *module) {
    auto logPath = jsi::Function::createFromHostFunction(
                                                     jsiRuntime,
                                                     jsi::PropNameID::forAscii(jsiRuntime,"logPath"),
                                                     0,
                                                     [](
                                                        jsi::Runtime &rt,
                                                        const jsi::Value &thisValue,
                                                        const jsi::Value *arguments,
                                                        size_t count
                                                    ) -> jsi::Value {
                                                        
                                                        auto path = [DevToolsModule logPath];
                                                        return jsi::String::createFromUtf8(rt, [path UTF8String] ?: "");
                                                    });
    
    auto writeLog = jsi::Function::createFromHostFunction(
                                                     jsiRuntime,
                                                     jsi::PropNameID::forAscii(jsiRuntime,"writeLog"),
                                                     1,
                                                     [module](
                                                        jsi::Runtime &rt,
                                                        const jsi::Value &thisValue,
                                                        const jsi::Value *arguments,
                                                        size_t count
                                                    ) -> jsi::Value {
                                                        auto message = arguments[0].asString(rt).utf8(rt);
                                                        auto nsString = [NSString stringWithUTF8String:message.c_str()];
                                                        
                                                        dispatch_async(module.logQueue, ^{
                                                            [DevToolsModule write:nsString];
                                                        });

                                                        return jsi::Value::undefined();
                                                    });
    
    auto deleteLogFile = jsi::Function::createFromHostFunction(
                                                     jsiRuntime,
                                                     jsi::PropNameID::forAscii(jsiRuntime,"deleteLogFile"),
                                                     1,
                                                     [module](
                                                        jsi::Runtime &rt,
                                                        const jsi::Value &thisValue,
                                                        const jsi::Value *arguments,
                                                        size_t count
                                                    ) -> jsi::Value {
                                                        auto message = arguments[0].asString(rt).utf8(rt);
                                                        auto nsString = [NSString stringWithUTF8String:message.c_str()];
                                                        
                                                        dispatch_async(module.logQueue, ^{
                                                            [DevToolsModule deleteLogFile:nsString];
                                                        });
                                                        return jsi::Value::undefined();
                                                    });
    
    
    // Create final object that will be injected into the global object
    auto exportModule = jsi::Object(jsiRuntime);
    exportModule.setProperty(jsiRuntime, "writeLog", move(writeLog));
    exportModule.setProperty(jsiRuntime, "logPath", move(logPath));
    exportModule.setProperty(jsiRuntime, "deleteLogFile", move(deleteLogFile));
    jsiRuntime.global().setProperty(jsiRuntime, "devTools", exportModule);
}

+(void) createLogFile {
    auto path = [DevToolsModule logPath];
    if (![[NSFileManager defaultManager] fileExistsAtPath:path]) {
        [[NSFileManager defaultManager] createFileAtPath:path contents:NULL attributes:NULL];
    }
}

+(NSString *) logPath {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    
    NSString *documentPath = (NSString*)[paths objectAtIndex:0];
    auto folderPath = [documentPath stringByAppendingString:@"/log.txt"];
    return folderPath;
}

+(void) deleteLogFile:(NSString*)atPath {
    
    if (![[NSFileManager defaultManager] fileExistsAtPath:atPath]) {
        return;
    }
    NSError *error;
    auto url = [NSURL fileURLWithPath:atPath];
    NSLog(@"deleteLogFile %@", [url absoluteString]);
    [[NSFileManager defaultManager] removeItemAtURL:url error:&error];
    NSLog(@"deleted %@", error.description);
}

+(void) write:(NSString*)message {
    [DevToolsModule createLogFile];
    auto path = [DevToolsModule logPath];
    NSLog(@"log %@", path);
    auto handle = [NSFileHandle fileHandleForWritingAtPath:path];
    [handle seekToEndOfFile];
    [handle writeData:[message dataUsingEncoding:NSUTF8StringEncoding]];
    [handle closeFile];
}

+(void) screenshot {
    auto layer = [[[UIApplication sharedApplication] keyWindow] layer];
    auto scale = [[UIScreen mainScreen] scale];
    UIGraphicsBeginImageContextWithOptions(layer.frame.size, false, scale);
    [layer renderInContext:UIGraphicsGetCurrentContext()];
    auto screenshot = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
}

@end
