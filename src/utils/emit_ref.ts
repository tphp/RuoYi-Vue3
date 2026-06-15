/**
 * 控件的直接输入，不需要防抖。负责父子组件交互表单值
 * @param props 组件的 props
 * @param emit 组件的 emit
 * @param key v-model 的名称，用于 emit
 */
export default function emitRef<T, K extends keyof T & string>(
  props: T,
  // eslint-disable-next-line no-unused-vars
  emit: (event: any, ...args: any[]) => void,
  key: K
) {
  return customRef<T[K]>((track: () => void, trigger: () => void) => {
    return {
      get(): any {
        track();
        return props[key]; // 返回 modelValue 的值
      },
      set(val: T[K]) {
        trigger();
        // 通过 emit 设置 modelValue 的值
        emit(`update:${key.toString()}`, val);
      },
    };
  });
}
