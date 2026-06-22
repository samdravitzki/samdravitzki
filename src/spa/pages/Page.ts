type PageActions = {
  navigate: (pathname: string) => void;
};

type Page = (container: HTMLElement, actions: PageActions) => void;

export default Page;
export type { PageActions };
