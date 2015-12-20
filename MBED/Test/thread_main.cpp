#include "mbed.h"
#include "TMP102.h"
#include "rtos.h"

#define TEMP_REG_ADDR 0x90

DigitalOut myled(LED1);

void my_thread_01(void const *args) {
    while (true) {
        printf("Hello je suis le thread 01\n");
        Thread::wait(1000);
    }
}

void my_thread_02(void const *args) {
    while (true) {
        printf("Hello je suis le thread 02\n");
        Thread::wait(300);
    }
}


int main() {

printf("lancement de l'application \n");
Thread thread1(my_thread_01);
Thread thread2(my_thread_02);
/*    
    TMP102 tmp(P0_0, P0_1, TEMP_REG_ADDR);

    printf(" tintin ?? \n");
    while(1) {
        myled = 1;
        wait(0.5);
        myled = 0;
        wait(0.5);
            printf(" WTF ?? \n");
        printf("Lounes : %f \n",tmp.read());
    }*/
    while(true);
}


