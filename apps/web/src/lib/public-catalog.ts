export type SingleProcess = {
  stepSlug: string // e.g. 'vestuario', 'gravacao'
  status: 'planned' | 'in-progress' | 'done'
  percent: number
}

export type Single = {
  slug: string
  title: string
  artist: string
  featured?: string[]
  producer?: string
  coverUrl?: string
  processes: SingleProcess[]
}

export type Concert = {
  slug: string
  title: string
  date: string // ISO
  venue?: string
  city?: string
  status: 'announced' | 'on-sale' | 'sold-out' | 'completed'
  ticketUrl?: string
  posterUrl?: string
}

export type MerchItem = {
  slug: string
  name: string
  price: number
  status: 'coming-soon' | 'available' | 'sold-out'
  imageUrl?: string
  buyUrl?: string
}

export const singles: Single[] = [
  {
    slug: 'single-01',
    title: 'Single 01',
    artist: 'Die Pretty',
    featured: ['Feat. TBD'],
    producer: 'Prod. TBD',
    coverUrl: 'https://source.unsplash.com/600x600/?music,cover',
    processes: [
      { stepSlug: 'vestuario', status: 'in-progress', percent: 40 },
      { stepSlug: 'gravacao', status: 'done', percent: 100 },
      { stepSlug: 'lancamento', status: 'planned', percent: 0 },
    ],
  },
]

export const concerts: Concert[] = [
  {
    slug: 'porto-2025',
    title: 'Porto – Showcase',
    date: '2025-12-15',
    venue: 'Hard Club',
    city: 'Porto',
    status: 'announced',
    ticketUrl: '#',
    posterUrl: 'https://source.unsplash.com/800x1000/?concert,poster',
  },
]

export const merch: MerchItem[] = [
  {
    slug: 'tee-logo',
    name: 'T-shirt Logo',
    price: 25,
    status: 'coming-soon',
    imageUrl: 'https://source.unsplash.com/640x640/?tshirt,streetwear',
  },
]
