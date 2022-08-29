import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import Posts, { getStaticProps } from '../../pages/posts'
import { getPrismicClient } from '../../services/prismic'

const posts = [
  { slug: 'my-title', title: 'My Title', excerpt: 'Post excerpt', updatedAt: '29 de agosto de 2022' }
]

jest.mock('../../services/prismic')

describe('Posts pages', () => {
  it('renders correctly', () => {
    render(
      <Posts posts={posts} />
    )

    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('load initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-title',
            data: {
              title: [
                { type: 'heading', text: 'My Title'}
              ],
              content: [
                { type: 'paragraph', text: 'Post excerpt'}
              ],
            },
            last_publication_date: '08-29-2022'
          }
        ]
      })
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [{
            slug: 'my-title',
            title: 'My Title',
            excerpt: 'Post excerpt',
            updatedAt: '29 de agosto de 2022',
          }]
        }
      })
    )
  })
})