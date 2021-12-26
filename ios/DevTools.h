#import <React/RCTBridgeModule.h>

@interface DevToolsModule : NSObject <RCTBridgeModule>

@property (nonatomic, assign) BOOL setBridgeOnMainQueue;
@property (nonatomic, strong) dispatch_queue_t logQueue;
@end
