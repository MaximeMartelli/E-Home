#include "mbed.h"
#include "BMP180.h"
#include "rtos.h"
#include "DHT11.h"
#include "SoftPWM.h"

#define SDA P0_27
#define SCL P0_28
#define DHT11_PIN P2_12
#define TIME_LED  500
#define WAIT_TEMPERATURE 3000
#define WAIT_PRESSION    3000
#define WAIT_PRESENCE    200
#define WAIT_BLE         1000
#define TX P4_28
#define RX P4_29
 
AnalogIn pot(P1_31);
SoftPWM led = P2_5;

Serial bluetooth(P4_28, P4_29);
 
 
int main()
{
    led.period_ms( 1 );
    
    while (1)   {
        if(pot.read() < 0.1)
            led = 0;
        else if (pot.read()> 0.9)
            led = 1;
        else 
            led = pot.read();
            
        bluetooth.printf("Lounes");
        printf("TX \n\r");  
        wait(2);
        
    }
}
