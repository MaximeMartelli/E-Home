#include "mbed.h"
#include "BMP180.h"
 
#define SDA P0_27
#define SCL P0_28
 


int main()
  {
  
     long temp =0;
     long pressure=0;
     int error =0;
     BMP180 bmp180(SDA, SCL);
     
     printf(" Bonjour \n\r");
     while(1) {
         error = bmp180.readTP(&temp,&pressure,OVERSAMPLING_ULTRA_HIGH_RESOLUTION);
         printf("Temp is %ld\r\n",temp);
         printf("Pressure is %ld\r\n",pressure);
         printf("Error is %d\r\n\r\n",error);
         wait(2);
     }
  }
