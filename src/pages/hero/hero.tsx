import React, { useCallback, useEffect, useState } from 'react'
// import Taro, { useShareAppMessage, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { View, Text, navigateTo, showToast } from 'remax/wechat'
import './hero.styl'
import NavigationBar from '../../components/navigation-bar';
import { useSelector } from 'react-redux';
import NotBindContent from '../../components/not-bind-content';
import Books from './books';
import { useQuery } from '@apollo/client';
import booksQuery from '../../schema/books.graphql'
import { TGlobalStore } from '../../reducers';
import { books, booksVariables } from '../../schema/__generated__/books';
import { wechatLogin_mpAuth_user } from '../../schema/__generated__/wechatLogin';
import { PAGINATION_STEP } from '../../constants/config';
import { usePageEvent } from '@remax/macro';


function HeroPage() {
  const user = useSelector<TGlobalStore, wechatLogin_mpAuth_user>(s => s.user.profile)
  const hasBind = !user.email.endsWith('@clippingkk.annatarhe.com')

  const [reachEnd, setReachEnd] = useState(false)

  const { data: books, fetchMore, loading, error, refetch } = useQuery<books, booksVariables>(booksQuery, {
    variables: {
      pagination: {
        limit: PAGINATION_STEP,
        offset: 0
      }
    },
  })
  usePageEvent('onPullDownRefresh', () => {
    refetch({
      pagination: {
        limit: PAGINATION_STEP,
        offset: 0
      }
    })
  })


  usePageEvent('onReachBottom', () => {
    fetchMore({
      variables: {
        pagination: {
          limit: PAGINATION_STEP,
          offset: books?.books.length
        }
      },
      updateQuery(prev: books, { fetchMoreResult }) {
        if (!fetchMoreResult || fetchMoreResult.books.length < PAGINATION_STEP) {
          setReachEnd(true)
          return prev
        }

        return {
          ...prev,
          books: [
            ...prev.books,
            ...fetchMoreResult.books
          ]
        } as books
      }
    })
  })

  usePageEvent('onShareAppMessage', () => {
    return {
      title: 'kindle ????????????',
      page: '/pages/landing/landing'
    }
  })

  const onNavigateUp = useCallback(() => {
    showToast({
      title: '??????????????????????????????~',
      icon: 'none'
    })
    return
    navigateTo({
      url: '/pages/search/search'
    })
  }, [])

  return (
    <View className='hero'>
      <NavigationBar hasHolder homeIcon='????' onBack={onNavigateUp}>
        <Text className='hero-title'>????????????</Text>
      </NavigationBar>
      <View className='hero-body'>
        {hasBind && books?.books ? (
          <Books
            books={books.books!}
            loading={loading}
            reachEnd={reachEnd}
          />
        ) : (
            <NotBindContent />
          )}
      </View>
    </View>
  )
}

export default HeroPage
