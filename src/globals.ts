export const COBENEFS = ["Air quality","Noise","Excess cold","Excess heat","Dampness","Congestion","Hassle costs","Road repairs","Road safety","Physical activity","Diet change"]
export const SCENARIOS = ["BNZ", "test", "all"]


export type CoBenefit = typeof COBENEFS[number]
export type Scenario = typeof SCENARIOS[number]

