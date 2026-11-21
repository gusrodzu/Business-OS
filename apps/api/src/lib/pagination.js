// Query parameters arrive as strings. Reject partial, exponential, negative and
// unsafe integers instead of silently parsing them into unexpected offsets.
function positiveInteger(value,fallback){
  if(typeof value!=='string'&&typeof value!=='number')return fallback;
  const text=String(value);
  if(!/^[0-9]+$/.test(text))return fallback;
  const number=Number(text);
  return Number.isSafeInteger(number)&&number>0?number:fallback;
}

export function paginationFromQuery(query,{defaultSize=50,maxSize=250}={}){
  const pageSize=Math.min(positiveInteger(query?.pageSize,defaultSize),maxSize);
  const requestedPage=positiveInteger(query?.page,1);
  // Prisma skip must remain a safe non-negative integer.
  const maxPage=Math.floor((Number.MAX_SAFE_INTEGER-pageSize)/pageSize)+1;
  const page=Math.min(requestedPage,maxPage);
  return {page,pageSize,skip:(page-1)*pageSize,take:pageSize};
}

export function pageMeta({page,pageSize,total}){
  return {page,pageSize,total,pages:Math.max(Math.ceil(total/pageSize),1),hasNext:page*pageSize<total,hasPrevious:page>1};
}
