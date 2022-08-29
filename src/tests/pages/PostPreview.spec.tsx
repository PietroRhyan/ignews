import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import PostPreview, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { getPrismicClient } from "../../services/prismic";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const post = {
  slug: "my-title",
  title: "My Title",
  content: "<p>Post excerpt</p>",
  updatedAt: "29 de agosto de 2022",
};

jest.mock("next-auth/react");
jest.mock("next/router");
jest.mock("../../services/prismic");

describe("PostPreview page", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce({ data: null, status: "loading" });

    render(<PostPreview post={post} />);

    expect(screen.getByText("My Title")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter)
    const pushMock = jest.fn()

    useSessionMocked.mockReturnValueOnce({
      data: {
        activeSubscription: 'fake-active-subscription',
      }
    } as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any)

    render(<PostPreview post={post} />)

    expect(pushMock).toHaveBeenCalledWith('/posts/my-title')
    
  })
  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My Title'}
          ],
          content: [
            { type: 'paragraph', text: 'Post excerpt'}
          ],
        },
        last_publication_date: '08-29-2022'
      })
    } as any)

    const response = await getStaticProps({
      params: {
        slug: 'my-title',
      }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-title',
            title: 'My Title',
            content: '<p>Post excerpt</p>',
            updatedAt: '29 de agosto de 2022'
          }
        }
      })
    )
  })
});
