import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_NOTES!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_NOTES!

const supabaseTodo = createClient(supabaseUrl, supabaseAnonKey)

/************************************************************************
 * Supabaseで対象のテーブルにRLSが設定されているか確認するためのテストスクリプト
 * 実行方法: npm run supabase-rls-test
 ************************************************************************/

/**
 * 確認用の関数
 */
type Assert = (ok: boolean, msg: string) => void
const assert: Assert = (ok, msg) => {
  if (ok) console.log(`✅ ${msg}`)
  else {
    console.error(`❌ ${msg}`)
    process.exitCode = 1
  }
}

/**
 * 匿名ユーザーで指定テーブルが読めないことを確認する
 * @param table 確認したいテーブル名
 * @returns 
 */
async function expectNoReadAsAnon(table: string) {
  // 取得件数を最小化（課金/転送量を抑える）
  const { data, error } = await supabaseTodo.from(table).select('id').limit(1)

  if (error) {
    // ポリシーで弾かれていればOK
    assert(true, `[${table}] 匿名はSELECTできずエラー（想定どおり）: ${error.code ?? error.message}`)
    return
  }

  if ((data?.length ?? 0) === 0) {
    // 0件でもOK（ただしテーブルが空なだけの可能性もあるので注意書き）
    assert(true, `[${table}] 匿名で0件（少なくともデータは露出していない）`)
  } else {
    // 1件でも返ってきたらNG（匿名で閲覧できている）
    assert(false, `[${table}] 匿名でデータが取得できてしまった！ RLS/ポリシー要確認`)
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('匿名ユーザーでテーブルが読めないことを確認します')
  await expectNoReadAsAnon('todo_items')
  await expectNoReadAsAnon('todo_lists')
  await expectNoReadAsAnon('todo_groups')
  console.log('--- 完了 ---')
}

main().catch(async (e) => {
  console.error('Test failed:', e)
  process.exitCode = 1
})

