import axios from 'axios'
import clsx from 'clsx'
import AirdropsTable from 'components/AirdropsTable'
import Anchor from 'components/Anchor'
import AnchorButton from 'components/AnchorButton'
import Button from 'components/Button'
import SearchInput from 'components/SearchInput'
import { useWallet } from 'contexts/wallet'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaArrowLeft, FaArrowRight, FaPlus } from 'react-icons/fa'
import { QueryFunctionContext, useQuery } from 'react-query'
import useDebounce from 'utils/debounce'
import { withMetadata } from 'utils/layout'

const AIRDROPS_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/airdrops`

const getAirdrops = async ({ queryKey }: QueryFunctionContext<string[]>) => {
  const [endpoint, address, page, search] = queryKey
  const { data } = await axios.get(endpoint, {
    params: { address, page, search },
  })
  return data
}

const AirdropListPage: NextPage = () => {
  const wallet = useWallet()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const searchDebounce = useDebounce(search, 1000)

  let { data: airdropsData = {}, isLoading: loading } = useQuery(
    [AIRDROPS_ENDPOINT, wallet.address, page.toString(), searchDebounce],
    getAirdrops,
    {
      onError: (err: Error) => {
        toast.error(err.message, { style: { maxWidth: 'none' } })
      },
    }
  )

  const previousOnClick = () => {
    if (page === 1) return
    setPage(page - 1)
  }

  const nextOnClick = () => {
    if (!airdropsData.hasMore) return
    setPage(page + 1)
  }

  useEffect(() => {
    setPage(1)
  }, [searchDebounce])

  return (
    <section className="flex flex-col px-12 pt-6 space-y-4 h-screen">
      <NextSeo title="Airdrops List" />

      {/* header section */}
      <div className="flex items-center space-x-4">
        <h1 className="font-heading text-4xl font-bold">Airdrops</h1>
        <SearchInput
          id="airdrop-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
        />
        <div className="flex-grow" />
        <AnchorButton href="/airdrops/create" leftIcon={<FaPlus />}>
          Create Airdrop
        </AnchorButton>
      </div>

      {/* description */}
      <p>Go through the available airdrops to claim your tokens!</p>

      {/* airdrops table loading placeholder */}
      {loading && (
        <div className="flex justify-center items-center p-8 space-x-4 text-xl text-center text-white/50">
          <CgSpinnerAlt className="animate-spin" />
          <span>Loading airdrops...</span>
        </div>
      )}

      {/* airdrops table */}
      <div className="overflow-auto max-h-[70%] no-scrollbar">
        {!loading && <AirdropsTable data={airdropsData.airdrops || []} />}
      </div>

      {/* Paginiation buttons */}
      {!loading && (
        <div className="flex justify-end space-x-4">
          <Button
            leftIcon={<FaArrowLeft />}
            isDisabled={page === 1}
            onClick={previousOnClick}
          >
            Previous page
          </Button>
          <Button
            rightIcon={<FaArrowRight />}
            isDisabled={!airdropsData.hasMore}
            onClick={nextOnClick}
          >
            Next page
          </Button>
        </div>
      )}
    </section>
  )
}

export default withMetadata(AirdropListPage, { center: false })
