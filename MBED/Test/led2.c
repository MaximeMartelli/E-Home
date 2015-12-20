#include "mbed.h"
#include "rtos.h"
#define TIME_LED 0.5

DigitalOut tab[] = {P2_13, P0_5, P0_4};

 
int main (void) {
    while (true) {

        tab[0] = 0; tab[1] = 0; tab[2] = 0;
        wait(TIME_LED );
        tab[0] = 1; tab[1] = 0; tab[2] = 0;
        wait(TIME_LED );
        tab[0] = 0; tab[1] = 1; tab[2] = 0;
        wait(TIME_LED );  
        tab[0] = 1; tab[1] = 1; tab[2] = 0;
        wait(TIME_LED );      
        tab[0] = 0; tab[1] = 0; tab[2] = 1;
        wait(TIME_LED );     
        tab[0] = 1; tab[1] = 0; tab[2] = 1;
        wait(TIME_LED );    
        tab[0] = 0; tab[1] = 1; tab[2] = 1;
        wait(TIME_LED );   
        tab[0] = 1; tab[1] = 1; tab[2] = 1;
        wait(0.5);
    }
}

