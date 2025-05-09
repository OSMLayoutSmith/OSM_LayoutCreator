from logic import * 
if __name__ == "__main__":
    # primero implementar el ejercicio de harry con la logica
    """
    si no llovio, Harry visito a Hagrid hoy
    Harry visito a hagrid o Dumbledore hoy, no a ambos
    harry visito a Dumbledore hoy
    """
    # Harry visitó a Hagrid hoy
    hagrid = Symbol("Hagrid")
    # Harry visitó a Dumbledore hoy
    dumbledore = Symbol("Dumbledore")
    # llovió
    rain = Symbol("Rain")
    # No llovió
    not_rain = Not(rain)
    # Harry no visitó a dumbledore hoy
    not_dumbledore = Not(dumbledore)
    #Harry no visitó a Hagrid hoy
    not_hagrid = Not(hagrid)
    #Harry visitó a Hagrid hoy y Harry no visitó a Dumbledore hoy
    and_hagrid_not_dumbledore = And(hagrid, not_dumbledore)
    #Harry no visitó a Hagrid hoy y Harry visitó a Dumbledore hoy
    and_not_hagrid_dumbledore = And(not_hagrid, dumbledore)
    # Si no llovió, Harry visitó a Hagrid hoy
    setence1 = Implication(not_rain, hagrid)
    # Harry visitó a Hagrid hoy o Harry visitó a Dumbledore hoy, no a ambos
    #sentence2 = Or(and_hagrid_not_dumbledore, and_not_hagrid_dumbledore) 
    sentece2 = Xor(hagrid, dumbledore)
    
    

    print(sentece2)
