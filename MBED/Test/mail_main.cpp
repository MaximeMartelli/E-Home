#include "mbed.h"
#include "rtos.h"
 
/* Mail */
typedef struct {
  char name[20];        /* name */
  uint32_t counter; /* A counter value               */
} mail_t;
 
Mail<mail_t, 16> mail_box;
 
void thread_01 (void const *args) 
{
    uint32_t i = 0;
    while (true) {
        i++; // fake data update
        mail_t *mail = mail_box.alloc();
        sprintf(mail->name, "%s", "Thread 01");
        mail->counter = i;
        mail_box.put(mail);
        Thread::wait(7000);
    }
}

void thread_02 (void const *args) 
{
    uint32_t i = 0;
    while (true) {
        i++; // fake data update
        mail_t *mail = mail_box.alloc();
        sprintf(mail->name, "%s", "Thread 02");
        mail->counter = i;
        mail_box.put(mail);
        Thread::wait(3000);
    }
}
 
 void recuperation()
 {
       while (true) {
        osEvent evt = mail_box.get();
        if (evt.status == osEventMail) {
            mail_t *mail = (mail_t*)evt.value.p;
            printf("\nName : %s\n\r", mail->name);
            printf("Number of cycles: %u\n\r", mail->counter);
            
            mail_box.free(mail);
        }
    }  
 }
 
int main (void) {
    Thread thread1(thread_01);
    Thread thread2(thread_02);

    recuperation();
}

