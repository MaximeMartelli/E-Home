#include "mbed.h"
#include "math.h"
#include "SoftPWM.h"
 
SoftPWM led[] = { LED1,LED2,LED3,LED4 };
 
int main()
{
    for ( int i=0; i<4; i++ ) led[i].period_ms( 1 );
    while (1)   {
        for ( int j=0; j<360; j+=10 ) {
            for ( int k=0; k<4; k++ ) {
                led[k] = cos( (j+k*90)*2.0*3.14/360 ) * 0.5 + 0.5;
                wait(0.01);
            }
        }
    }
}


        tab[0] = 0; tab[1] = 0; tab[2] = 0;
        wait(0.5);
        tab[0] = 1; tab[1] = 0; tab[2] = 0;
        wait(0.5);
        tab[0] = 0; tab[1] = 1; tab[2] = 0;
        wait(0.5);  
        tab[0] = 1; tab[1] = 1; tab[2] = 0;
        wait(0.5);      
        tab[0] = 0; tab[1] = 0; tab[2] = 1;
        wait(0.5);     
        tab[0] = 1; tab[1] = 0; tab[2] = 1;
        wait(0.5);    
        tab[0] = 0; tab[1] = 1; tab[2] = 1;
        wait(0.5);   
        tab[0] = 1; tab[1] = 1; tab[2] = 1;
        wait(0.5);
