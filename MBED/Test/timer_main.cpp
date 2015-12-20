#include "mbed.h"
#include "rtos.h"
 

 
void blink(void const *n) {
    printf(" TIMER %d \n\r",n);
}
 
int main(void) {
    RtosTimer led_1_timer(blink, osTimerPeriodic, (void *)0);
    RtosTimer led_2_timer(blink, osTimerPeriodic, (void *)1);
    RtosTimer led_3_timer(blink, osTimerPeriodic, (void *)2);
    RtosTimer led_4_timer(blink, osTimerPeriodic, (void *)3);
    
    led_1_timer.start(1000);
    led_2_timer.start(2000);
    led_3_timer.start(3000);
    led_4_timer.start(4000);
    
    Thread::wait(osWaitForever);
}
