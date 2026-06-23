type PageActions = {
  navigate: (pathname: string) => void;
};

type PageCleanup = () => void;

type Page = (
  container: HTMLElement,
  actions: PageActions,
) => PageCleanup | void;

export default Page;
export type { PageActions, PageCleanup };
