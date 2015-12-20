
AnalogIn pot(P1_31);
SoftPWM led = P2_5;
 
int main()
{
    led.period_ms( 1 );
    
    while (1)   {
        if(pot.read() < 0.1)
            led = 0;
        else if (pot.read()> 0.9)
            led = 1;
        else 
            led = pot.read();
    }
}
