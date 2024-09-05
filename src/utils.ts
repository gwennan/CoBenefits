// This function performs an "inner join" on the 'id' field
export function joinArraysOld(arr1: Array<any>, arr2: Array<any>, key: string) {
  return arr1.map(item1 => ({
    ...item1,
    ...arr2.find(item2 => item2[key] === item1[key])
  })).filter(item => item[Object.keys(arr2[0])[1]] !== undefined);
}

export function joinArrays(arr1: Array<any>, arr2: Array<any>, key: string) {
  // Create a map from arr2
  const map = new Map(arr2.map(item => [item[key], item]));

  // Join arr1 with the map
  return arr1.reduce((result, item) => {
    const match = map.get(item[key]);
    if (match) {
      result.push({ ...item, ...match });
    }
    return result;
  }, []);
}