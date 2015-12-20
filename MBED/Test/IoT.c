#include "mbed.h"
#include "BMP180.h"
#include "rtos.h"
#include "DHT11.h"

#define SDA P0_27
#define SCL P0_28
#define DHT11_PIN P2_12
#define TIME_LED  300

 
Semaphore two_slots(1);
 
void thread_temperature(void const *name) {
    DHT11 capteur(DHT11_PIN);
    int tmp;
    while (true) {
        two_slots.wait();
        printf("%s\n\r", (const char*)name);
        tmp = capteur.readData();
        if (tmp != DHT11::OK) {
            printf("Error! %d\r\n",tmp);
        }
        else {
            printf("Temperature: %d, Humidity: %d\r\n", capteur.readTemperature(), capteur.readHumidity());
        }
        two_slots.release();
        Thread::wait(2000);
    } 
}

void thread_led(void const *name) {
    DigitalOut tab[] = {P2_13, P0_1, P0_0};
    while (true) {
        two_slots.wait();
        printf("%s\n\r", (const char*)name);
        //printf("000 \n\r");
        tab[0] = 0; tab[1] = 0; tab[2] = 0;
        two_slots.release();
        Thread::wait(TIME_LED );
        two_slots.wait();         
        //printf("100 \n\r");       
        tab[0] = 1; tab[1] = 0; tab[2] = 0;
        two_slots.release();
        Thread::wait(TIME_LED );
        two_slots.wait();  
        //printf("010 \n\r"); 
        tab[0] = 0; tab[1] = 1; tab[2] = 0;
        two_slots.release();
        Thread::wait(TIME_LED );
        two_slots.wait();   
        //printf("110 \n\r"); 
        tab[0] = 1; tab[1] = 1; tab[2] = 0;
        two_slots.release();
        Thread::wait(TIME_LED );
        two_slots.wait();       
        //printf("001 \n\r"); 
        tab[0] = 0; tab[1] = 0; tab[2] = 1;
        two_slots.release();
        Thread::wait(TIME_LED );
        two_slots.wait();     
        //printf("101 \n\r"); 
        tab[0] = 1; tab[1] = 0; tab[2] = 1;
        two_slots.release();
        Thread::wait(TIME_LED );
        two_slots.wait();    
        //printf("011 \n\r"); 
        tab[0] = 0; tab[1] = 1; tab[2] = 1;
        two_slots.release();
        Thread::wait(TIME_LED );
    }
}

void thread_pression(void const *name) {
    long temp =0;
    long pressure=0;
    int error =0;
    BMP180 bmp180(SDA, SCL);
    
    while (true) {
        two_slots.wait();
        printf("%s\n\r", (const char*)name);
        error = bmp180.readTP(&temp,&pressure,OVERSAMPLING_ULTRA_HIGH_RESOLUTION);
        printf("Temp is %1.0f\r\n",(float)(temp/10));
        printf("Pressure is %ld\r\n",pressure);
        printf("Error is %d\r\n\r\n",error);
        two_slots.release();
        Thread::wait(10000);
    } 
}
  
void thread_presence(void const *name) {
    while (true) {
        two_slots.wait();
        printf("%s\n\r", (const char*)name);
        
        two_slots.release();
        Thread::wait(20000);
    }
}
 
int main (void) {
    Thread t1(thread_temperature, (void *)"Thread temperature");
    Thread t2(thread_pression   , (void *)"Thread pression");
    Thread t3(thread_presence   , (void *)"Thread presence");
      
    thread_led((void *)"Thread Led");
}

