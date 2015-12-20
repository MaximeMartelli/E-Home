#include "mbed.h"
#include "rtos.h"


#define TX P4_28
#define RX P4_29
 
Serial bluetooth(TX, RX);
  
void lectureBle(void){
    char c;
        
    while(!bluetooth.readable());
    while(bluetooth.readable()) {
            c = bluetooth.getc(); // lecture 
            printf("%c",c);
    }
    printf("\n- FIN \n\r");
    wait(1);
}  
  
int main (void) {
  /* 
    bluetooth.printf("AT+RENEW");
    lectureBle();
    
    bluetooth.printf("AT+RESET"); 
    lectureBle();
    
    bluetooth.printf("AT"); 
    lectureBle();
    
    bluetooth.printf("AT+NAMELouneS"); 
    lectureBle();
    
    bluetooth.printf("AT+MODE2"); 
    lectureBle();
    // Make me connectable baby
    bluetooth.printf("AT+ADTY0"); 
    lectureBle();
  
    bluetooth.printf("AT+UUID0x2800"); 
    lectureBle();    
   
    bluetooth.printf("AT+CHAR0x6666"); 
    lectureBle(); 
    
/*
    /*
    bluetooth.printf("AT+RESET"); 
    lectureBle();*/
        
    while (true) {
        wait(2);
        printf("1\r\n");
        bluetooth.printf("temperature:%d",15);
        
        wait(2);
        printf("6\n\r");
        bluetooth.printf("passage:%d",66);
    }
}

