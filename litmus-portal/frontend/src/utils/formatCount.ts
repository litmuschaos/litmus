const formatCount = (count: number | undefined): string => {
  if (count)
    if (count >= 1000000)
      /*
      If count provided is greater than or equal to
      1000000 then round it to the floor value and append
      an 'M' to the end
    */
      return `${(Math.floor(count / 100000) / 10).toFixed(1)}M`;
    /*
      If count provided is greater than or equal to
      1000 then round it to the floor value and append
      a 'k' to the end
    */ else if (
      count >= 1000
    )
      return `${(Math.floor(count / 100) / 10).toFixed(1)}k`;
    else return `${count}`;
  return '0';
};

export default formatCount;
