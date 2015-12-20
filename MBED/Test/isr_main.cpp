#include "mbed.h"
#include "rtos.h"
 
Queue<uint32_t, 5> queue;
 
DigitalOut myled(LED1);
 
void queue_isr() {
    queue.put((uint32_t*)2);
    myled = !myled;
}
 
 
int main (void) {
    
    Ticker ticker;
    ticker.attach(queue_isr, 3.0);
    
    while (true) {
        osEvent evt = queue.get();
        if (evt.status != osEventMessage) {
            printf("queue->get() returned %02x status\n\r", evt.status);
        } else {
            printf("queue->get() returned %d\n\r", evt.value.v);
        }
    }
}

