/**
 * Upstash Redis REST API クライアント
 */

interface UpstashRedisResponse<T = any> {
  result: T
  error?: string
}

class UpstashRedisClient {
  private readonly restUrl: string
  private readonly restToken: string

  constructor() {
    this.restUrl = process.env.UPSTASH_REDIS_REST_URL!
    this.restToken = process.env.UPSTASH_REDIS_REST_TOKEN!

    if (!this.restUrl || !this.restToken) {
      throw new Error('Upstash Redis環境変数が設定されていません')
    }
  }

  private async request<T = any>(command: string[]): Promise<T> {
    try {
      const response = await fetch(`${this.restUrl}/${command.join('/')}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.restToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Redis request failed: ${response.status} ${response.statusText}`)
      }

      const data: UpstashRedisResponse<T> = await response.json()
      
      if (data.error) {
        throw new Error(`Redis error: ${data.error}`)
      }

      return data.result
    } catch (error) {
      console.error('Upstash Redis request error:', error)
      throw error
    }
  }

  /**
   * キーの値を取得
   */
  async get(key: string): Promise<string | null> {
    return await this.request<string | null>(['GET', key])
  }

  /**
   * キーに値を設定（TTL付き）
   */
  async setex(key: string, seconds: number, value: string): Promise<string> {
    return await this.request<string>(['SETEX', key, seconds.toString(), value])
  }

  /**
   * キーの値をインクリメント
   */
  async incr(key: string): Promise<number> {
    return await this.request<number>(['INCR', key])
  }

  /**
   * キーにTTLを設定
   */
  async expire(key: string, seconds: number): Promise<number> {
    return await this.request<number>(['EXPIRE', key, seconds.toString()])
  }

  /**
   * キーのTTLを取得
   */
  async ttl(key: string): Promise<number> {
    return await this.request<number>(['TTL', key])
  }

  /**
   * 複数のコマンドを一度に実行（Pipeline）
   */
  async pipeline(commands: string[][]): Promise<any[]> {
    try {
      const response = await fetch(`${this.restUrl}/pipeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.restToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commands),
      })

      if (!response.ok) {
        throw new Error(`Redis pipeline failed: ${response.status} ${response.statusText}`)
      }

      const results = await response.json()
      return results.map((result: UpstashRedisResponse) => {
        if (result.error) {
          throw new Error(`Redis pipeline error: ${result.error}`)
        }
        return result.result
      })
    } catch (error) {
      console.error('Upstash Redis pipeline error:', error)
      throw error
    }
  }

  /**
   * レート制限専用: インクリメント＋TTL設定を原子的に実行
   */
  async incrWithExpire(key: string, ttlSeconds: number): Promise<{
    count: number
    ttl: number
  }> {
    const commands = [
      ['INCR', key],
      ['TTL', key]
    ]

    const [count, currentTtl] = await this.pipeline(commands)

    // TTLが設定されていない場合（新規キーまたは永続キー）は TTL を設定
    if (currentTtl === -1) {
      await this.expire(key, ttlSeconds)
      return { count, ttl: ttlSeconds }
    }

    return { count, ttl: currentTtl }
  }
}

// シングルトンインスタンス
export const upstashRedis = new UpstashRedisClient()