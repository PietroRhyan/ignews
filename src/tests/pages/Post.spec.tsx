import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { getPrismicClient } from '../../services/prismic'
import { getSession } from 'next-auth/react'

const post = { slug: 'my-title', title: 'My Title', content: '<p>Post excerpt</p>', updatedAt: '29 de agosto de 2022' }

jest.mock('next-auth/react')
jest.mock('../../services/prismic')

describe('Post page', () => {
  it('renders correctly', () => {
    render(
      <Post post={post} />
    )

    expect(screen.getByText('My Title')).toBeInTheDocument()
    expect(screen.getByText('Post excerpt')).toBeInTheDocument()
  })

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    } as any)

    const response = await getServerSideProps({
      params: {
        slug: 'my-title',
      }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        })
      })
    )
  })

  it('loads initial data', async () => {
    const getSessionMocked = mocked(getSession)
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

    getSessionMocked.mockReturnValueOnce({
      activeSubscription: 'fake-active-subscription',
    } as any)

    const response = await getServerSideProps({
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

  
})