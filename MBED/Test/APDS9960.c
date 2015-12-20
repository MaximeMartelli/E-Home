#include "mbed.h"
#include "rtos.h"
//#include "DHT11.h"
#include "apds9960.h"


Ticker timer;
Serial pc(USBTX, USBRX);
apds9960 sensor(P0_0,P0_1);
bool intFlag = false;
InterruptIn interrupt(P0_23);
DigitalOut myled(LED1);
 
void trigger() {    
//    pc.printf("triggered\n\r");
    intFlag = true;
}
 
void printGesture(int gesture) {
    switch ( gesture ) {
        case DIR_UP:
            pc.printf("UP\n\r");
            break;
        case DIR_DOWN:
            pc.printf("DOWN\n\r");
            break;
        case DIR_LEFT:
            pc.printf("LEFT\n\r");
            break;
        case DIR_RIGHT:
            pc.printf("RIGHT\n\r");
            break;
        case DIR_NEAR:
            pc.printf("NEAR\n\r");
            break;
        case DIR_FAR:
            pc.printf("FAR\n\r");
            break;
        default:
            pc.printf("NONE\n\r");
    }
}
 
int getGesture() {
 
    if(sensor.isGestureAvailable()) {
        pc.printf("Gesture Available!\n\r");
        // Process it.
        switch ( sensor.readGesture() ) {
            case DIR_UP: return DIR_UP;
            case DIR_DOWN: return DIR_DOWN;
            case DIR_LEFT: return DIR_LEFT;
            case DIR_RIGHT: return DIR_RIGHT;
            case DIR_NEAR: return DIR_NEAR;
            case DIR_FAR: return DIR_FAR;
            default: return DIR_NONE;
        }
    }
    return DIR_NONE;
}
 
int main()
{
    pc.baud(115200);
    pc.printf("Start\n\r");
    
    myled = 0;
    
    if ( sensor.ginit(pc) ) {
        pc.printf("APDS-9960 initialization complete\n\r");
    } else {
        pc.printf("Something went wrong during APDS-9960 init\n\r");
        return 1;
    }
 
    // Start running the APDS-9960 gesture sensor engine
    if ( sensor.enableGestureSensor(true) ) {
        pc.printf("Gesture sensor is now running\n\r");
    } else {
        pc.printf("Something went wrong during gesture sensor init!\n\r");
        return 1;
    }
 
    interrupt.fall(&trigger);
           
    while(1) {
        
        // when interrupt trigerred, flag is set.
        if(intFlag) {
            //
            printGesture(getGesture());
            
            // Clean interrupt handler flag.
            intFlag = false;
        }
            
        // Do somethings else
        wait_ms(100);
    }
}
