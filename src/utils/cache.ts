const __DICT__ = ref({})

const __getTime = (time: any) => {
  if (typeof time != "number") {
    return 0
  }
  return Math.floor(time / 1000)
}

function __sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const __getDict = (key: any) => {
  if (!__DICT__.value[key]) {
    __DICT__.value[key] = {}
  }
  return __DICT__.value[key]
}

const __getData = (data: any) => {
  if (!data) {
    return data
  }
  if (typeof data == "object") {
    return JSON.parse(JSON.stringify(data))
  }
  return data
}

export function cacheTime(key: any, time: number) {
  __getDict(key).cacheTime = time
}

export default async function cache(key: any, func: any=undefined, ...args: any) {
  const dict = __getDict(key)
  const subTime = __getTime(new Date().getTime()) - __getTime(dict?.time)
  let cacheTime = dict?.cacheTime;
  if (typeof cacheTime != "number") {
    cacheTime = 10
  }
  if (subTime < cacheTime) {
    while (dict?.lock) {
      await __sleep(100)
    }
    return __getData(dict?.data)
  }

  if (func instanceof Function) {
    func = func(...args)
  }

  dict.time = new Date().getTime()
  if (func instanceof Promise) {
    delete dict.data
    dict.lock = true
    dict.data = await func
    dict.lock = false
  } else {
    delete dict.data
  }
  return __getData(dict?.data)
}