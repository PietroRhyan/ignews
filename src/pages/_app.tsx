// Importação das tipagens do 'Component'
import { AppProps } from 'next/app'

import '../styles/global.scss'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
