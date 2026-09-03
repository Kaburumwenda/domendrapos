import type { ComputedRef, MaybeRef } from 'vue'

type ComponentProps<T> = T extends new(...args: any) => { $props: infer P } ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any ? P
  : {}

declare module 'nuxt/app' {
  interface NuxtLayouts {
    auth: ComponentProps<typeof import("D:/Projects/MY-APPS-2/DomendraPOS/frontend/layouts/auth.vue").default>
    default: ComponentProps<typeof import("D:/Projects/MY-APPS-2/DomendraPOS/frontend/layouts/default.vue").default>
    docs: ComponentProps<typeof import("D:/Projects/MY-APPS-2/DomendraPOS/frontend/layouts/docs.vue").default>
    onboarding: ComponentProps<typeof import("D:/Projects/MY-APPS-2/DomendraPOS/frontend/layouts/onboarding.vue").default>
  }
  export type LayoutKey = keyof NuxtLayouts extends never ? string : keyof NuxtLayouts
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false> | {
      [K in LayoutKey]: {
        name?: MaybeRef<K | false> | ComputedRef<K | false>
        props?: NuxtLayouts[K]
      }
    }[LayoutKey]
  }
}