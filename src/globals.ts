export const COBENEFS = ["Air quality", "Noise", "Excess cold", "Excess heat", "Dampness", "Congestion", "Hassle costs", "Road repairs", "Road safety", "Physical activity", "Diet change"]
export const SCENARIOS = ["BNZ", "test"]
// export const SCENARIOS = ["BNZ", "test", "all"]
export let SEF = ['Under_35',
       'Over_65', 'EPC', 'Median_Income', 'Tenure', 'Typology', 'Unemployment',
       'Rurality', 'House_value', 'Fuel_Type', 'Fuel_consumption_total',
       'Floor_area', 'Gas_flag', 'Number_cars', 'Urban_trips', 'Total_vkm',
       'Urban_vkm']

export const SEF_CATEGORICAL = ["EPC", "Tenure", "Typology", "Rurality", "Fuel_Type", "Gas_flag", "Number_cars"]

SEF.sort((a,b) => (SEF_CATEGORICAL.includes(b)) - (SEF_CATEGORICAL.includes(a)))

// The years labels have an Y for start otherwise it causes sql issues
// export const TIMES = ["2025_2029", "2030_2034", "2035_2039", "2040_2044", "2045_2040"]
// export const TIMES = ["Y2025_2029", "Y2030_2034", "Y2035_2039", "Y2040_2044", "Y2045_2049"]
export const TIMES = ["Y2025", "Y2026", "Y2027", "Y2028", "Y2029", "Y2030", "Y2031", "Y2032", "Y2033", "Y2034", "Y2035", "Y2036", "Y2037", "Y2038", "Y2039", "Y2040", "Y2041", "Y2042", 
    "Y2043", "Y2044", "Y2045", "Y2046", "Y2047", "Y2048", "Y2049", "Y2050"]

export type CoBenefit = typeof COBENEFS[number]
export type Scenario = typeof SCENARIOS[number]
export type SEFactor = typeof COBENEFS[number]


// DESIGN PARAMS
export const VIS_COLOR = "black";
export const AVERAGE_COLOR = "gray";
export const MARGINS = {
        marginLeft: 60,
        marginRight: 60,
        marginBottom: 60,
        marginTop: 60
    }

export const AVERAGE_DX = 20;


