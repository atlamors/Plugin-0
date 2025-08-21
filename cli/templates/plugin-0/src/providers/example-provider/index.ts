// ProviderContext type is not exported as such; keep this provider
// as a no-op stub until you implement a real module provider.

type ExampleProviderOptions = {
  greeting?: string
}

export default function exampleProvider({ options }: { options?: ExampleProviderOptions }) {
  const greeting = options?.greeting ?? "Hello from plugin-0 provider"

  return {
    getId: () => "plugin-0:example-provider",
    send: async (to: string, message: string) => {
      // Placeholder no-op implementation
      return { to, message: `${greeting}: ${message}` }
    },
  }
}


