#include "mbed.h"
#include "TMP102.h"
#include "rtos.h"

#define TEMP_REG_ADDR 0x90

Mutex my_mutex; 
int temp = 0;


void notify(TMP102 tmp) 
{
    my_mutex.lock();
        temp = tmp.read();
    my_mutex.unlock();
}
 
void thread_read(void const *args) 
{
     TMP102 tmp(P0_0, P0_1, TEMP_REG_ADDR);

    while (true) {
        notify(tmp);
        Thread::wait(1000);
    }
}

void thread_write(void const *args)
{
    while (true) {
    my_mutex.lock();
        printf(" temperature %d \n",temp);
    my_mutex.unlock();
    Thread::wait(1000);
    }
}
 
int main() {
    
    Thread t1(thread_write);
    Thread t2(thread_read);
    
    while(true);
}

