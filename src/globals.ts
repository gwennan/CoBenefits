export const COBENEFS = ["Air quality", "Noise", "Excess cold", "Excess heat", "Dampness", "Congestion", "Hassle costs", "Road repairs", "Road safety", "Physical activity", "Diet change"]
export const SCENARIOS = ["BNZ", "test", "all"]
export let SEF = ['Under_35',
       'Over_65', 'EPC', 'Median_Income', 'Tenure', 'Typology', 'Unemployment',
       'Rurality', 'House_value', 'Fuel_Type', 'Fuel_consumption_total',
       'Floor_area', 'Gas_flag', 'Number_cars', 'Urban_trips', 'Total_vkm',
       'Urban_vkm']

export const SEF_CATEGORICAL = ["EPC", "Tenure", "Typology", "Rurality", "Fuel_Type", "Gas_flag", "Number_cars"]

SEF.sort((a,b) => (SEF_CATEGORICAL.includes(b)) - (SEF_CATEGORICAL.includes(a)))

console.log(23, SEF)





export type CoBenefit = typeof COBENEFS[number]
export type Scenario = typeof SCENARIOS[number]
export type SEFactor = typeof COBENEFS[number]


