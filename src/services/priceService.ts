import { PriceData, PricePoint, CryptoSymbol, CryptoPrice } from '../types';

// 模拟基础价格数据
const MOCK_BASE_PRICES: Record<CryptoSymbol, number> = {
  BTC: 97245.32,
  ETH: 3856.78,
  SOL: 198.45,
  MON: 2.35, // Monad 代币模拟价格
};

// 币种配置
const CRYPTO_CONFIG: Record<CryptoSymbol, {
  name: string;
  icon: string;
  volatility: number;
  binanceSymbol: string;
}> = {
  BTC: { name: 'Bitcoin', icon: '₿', volatility: 0.02, binanceSymbol: 'btcusdt' },
  ETH: { name: 'Ethereum', icon: 'Ξ', volatility: 0.03, binanceSymbol: 'ethusdt' },
  SOL: { name: 'Solana', icon: '◎', volatility: 0.05, binanceSymbol: 'solusdt' },
  MON: { name: 'Monad', icon: '◈', volatility: 0.08, binanceSymbol: '' }, // MON 使用模拟数据
};

export class PriceService {
  private static instance: PriceService;
  private listeners: ((data: PriceData) => void)[] = [];
  private interval: number | null = null;
  private currentPrices: Record<CryptoSymbol, number> = { ...MOCK_BASE_PRICES };
  private priceHistory: Record<CryptoSymbol, PricePoint[]> = {
    BTC: [], ETH: [], SOL: [], MON: []
  };
  private ws: WebSocket | null = null;
  private useRealData: boolean = false;
  private activeSymbol: CryptoSymbol = 'BTC';

  // 每秒价格对比 - 记录上一秒的价格
  private lastSecondPrices: Record<CryptoSymbol, number> = { ...MOCK_BASE_PRICES };
  private secondChangePercent: Record<CryptoSymbol, number> = {
    BTC: 0, ETH: 0, SOL: 0, MON: 0
  };

  // 模拟价格波动参数
  private trend: Record<CryptoSymbol, number> = {
    BTC: 0, ETH: 0, SOL: 0, MON: 0
  };

  private constructor() {
    // 初始化所有币种的价格历史
    this.initializePriceHistory();
  }

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  // 初始化价格历史（生成过去1小时的模拟数据）
  private initializePriceHistory() {
    const now = Date.now();

    (Object.keys(MOCK_BASE_PRICES) as CryptoSymbol[]).forEach(symbol => {
      let price = MOCK_BASE_PRICES[symbol];
      const history: PricePoint[] = [];

      for (let i = 60; i >= 0; i--) {
        const timestamp = now - i * 60000;
        const volatility = CRYPTO_CONFIG[symbol].volatility;
        const change = (Math.random() - 0.5) * volatility;
        price = price * (1 + change);
        history.push({ price, timestamp });
      }

      this.priceHistory[symbol] = history;
      this.currentPrices[symbol] = price;
    });
  }

  // 连接价格数据源
  connect(useRealData: boolean = false, symbol: CryptoSymbol = 'BTC') {
    this.useRealData = useRealData;
    this.activeSymbol = symbol;

    if (useRealData && symbol !== 'MON') {
      this.connectRealData(symbol);
    } else {
      this.startMockData();
    }
  }

  // 切换当前币种
  switchSymbol(symbol: CryptoSymbol) {
    this.activeSymbol = symbol;
    // 重新连接以获取新币种数据
    this.disconnect();
    this.connect(this.useRealData, symbol);
  }

  // 连接真实数据（Binance WebSocket）
  private connectRealData(symbol: CryptoSymbol) {
    try {
      const binanceSymbol = CRYPTO_CONFIG[symbol].binanceSymbol;
      if (!binanceSymbol) {
        this.startMockData();
        return;
      }

      this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol}@ticker`);

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // 更新当前币种价格
        this.currentPrices[symbol] = parseFloat(data.c);
        this.addPricePoint(symbol, this.currentPrices[symbol]);

        // 同时模拟其他币种的价格变动
        this.simulateOtherPrices(symbol);

        // 构建完整价格数据
        const priceData = this.buildPriceData();
        this.notifyListeners(priceData);
      };

      this.ws.onerror = () => {
        this.startMockData();
      };

      this.ws.onclose = () => {
        this.startMockData();
      };
    } catch {
      this.startMockData();
    }
  }

  // 模拟其他币种价格
  private simulateOtherPrices(excludeSymbol: CryptoSymbol) {
    (Object.keys(CRYPTO_CONFIG) as CryptoSymbol[]).forEach(symbol => {
      if (symbol === excludeSymbol) return;

      const volatility = CRYPTO_CONFIG[symbol].volatility;
      const randomChange = (Math.random() - 0.5) * volatility;
      const trendChange = this.trend[symbol] * 0.0001;

      this.currentPrices[symbol] = this.currentPrices[symbol] * (1 + randomChange + trendChange);
      this.addPricePoint(symbol, this.currentPrices[symbol]);

      // 随机更新趋势
      if (Math.random() < 0.1) {
        this.trend[symbol] = (Math.random() - 0.5) * 2;
      }
    });
  }

  // 启动模拟数据
  private startMockData() {
    if (this.interval) return;

    console.log('[PriceService] Starting mock price data for all cryptos');

    this.interval = window.setInterval(() => {
      // 更新所有币种价格
      (Object.keys(CRYPTO_CONFIG) as CryptoSymbol[]).forEach(symbol => {
        const volatility = CRYPTO_CONFIG[symbol].volatility;
        const randomChange = (Math.random() - 0.5) * volatility;
        const trendChange = this.trend[symbol] * 0.0001;
        const totalChange = randomChange + trendChange;

        // 先保存上一秒价格
        const lastPrice = this.currentPrices[symbol];
        
        // 更新当前价格
        this.currentPrices[symbol] = this.currentPrices[symbol] * (1 + totalChange);
        this.addPricePoint(symbol, this.currentPrices[symbol]);

        // 保存上一秒价格并计算每秒涨跌百分比
        this.lastSecondPrices[symbol] = lastPrice;
        const currentPrice = this.currentPrices[symbol];
        this.secondChangePercent[symbol] = ((currentPrice - lastPrice) / lastPrice) * 100;

        // 随机更新趋势
        if (Math.random() < 0.1) {
          this.trend[symbol] = (Math.random() - 0.5) * 2;
        }
      });

      // 构建并发送完整价格数据
      const priceData = this.buildPriceData();
      this.notifyListeners(priceData);
    }, 1000); // 每秒更新
  }

  // 构建完整价格数据对象
  private buildPriceData(): PriceData {
    const cryptos: Record<CryptoSymbol, CryptoPrice> = {} as Record<CryptoSymbol, CryptoPrice>;

    (Object.keys(CRYPTO_CONFIG) as CryptoSymbol[]).forEach(symbol => {
      const history = this.priceHistory[symbol];
      const currentPrice = this.currentPrices[symbol];
      const price24hAgo = history[0]?.price || currentPrice;
      const priceChange24h = currentPrice - price24hAgo;
      const priceChangePercent24h = (priceChange24h / price24hAgo) * 100;

      cryptos[symbol] = {
        symbol,
        price: currentPrice,
        priceChange24h,
        priceChangePercent24h,
        fundingRate: this.calculateFundingRate(),
        longShortRatio: 1.0 + Math.random() * 0.8,
        high24h: Math.max(...history.map(p => p.price), currentPrice),
        low24h: Math.min(...history.map(p => p.price), currentPrice),
        volume24h: 25000 + Math.random() * 5000,
        lastUpdate: Date.now(),
      };
    });

    const activeCrypto = cryptos[this.activeSymbol];
    const secondChange = this.secondChangePercent[this.activeSymbol];

    return {
      // 主币种数据（兼容旧代码）
      symbol: this.activeSymbol,
      price: activeCrypto.price,
      priceChange24h: activeCrypto.priceChange24h,
      priceChangePercent24h: activeCrypto.priceChangePercent24h,
      // 每秒涨跌（与上一秒对比）
      secondChangePercent: secondChange,
      fundingRate: activeCrypto.fundingRate,
      longShortRatio: activeCrypto.longShortRatio,
      high24h: activeCrypto.high24h,
      low24h: activeCrypto.low24h,
      volume24h: activeCrypto.volume24h,
      lastUpdate: Date.now(),
      // 兼容旧代码
      btcPrice: cryptos.BTC.price,
      // 所有币种数据
      cryptos,
    };
  }

  // 计算资金费率（模拟）
  private calculateFundingRate(): number {
    return (Math.random() - 0.5) * 0.002;
  }

  // 添加价格点
  private addPricePoint(symbol: CryptoSymbol, price: number) {
    this.priceHistory[symbol].push({
      price,
      timestamp: Date.now(),
    });

    // 只保留最近2小时的数据
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;
    this.priceHistory[symbol] = this.priceHistory[symbol].filter(p => p.timestamp > cutoff);
  }

  // 通知所有监听器
  private notifyListeners(data: PriceData) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch {
        // 忽略监听器错误
      }
    });
  }

  // 订阅价格更新
  subscribe(callback: (data: PriceData) => void): () => void {
    this.listeners.push(callback);

    // 立即返回当前数据
    const initialData = this.buildPriceData();
    callback(initialData);

    // 返回取消订阅函数
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // 获取当前价格
  getCurrentPrice(symbol: CryptoSymbol = this.activeSymbol): number {
    return this.currentPrices[symbol];
  }

  // 获取所有币种当前价格
  getAllCurrentPrices(): Record<CryptoSymbol, number> {
    return { ...this.currentPrices };
  }

  // 获取价格历史
  getPriceHistory(symbol: CryptoSymbol = this.activeSymbol): PricePoint[] {
    return [...this.priceHistory[symbol]];
  }

  // 获取币种配置
  getCryptoConfig(symbol: CryptoSymbol) {
    return CRYPTO_CONFIG[symbol];
  }

  // 获取所有币种配置
  getAllCryptoConfigs() {
    return { ...CRYPTO_CONFIG };
  }

  // 获取当前活跃币种
  getActiveSymbol(): CryptoSymbol {
    return this.activeSymbol;
  }

  // 获取价格变化（用于结算）
  getPriceChange(symbol: CryptoSymbol = this.activeSymbol, duration: number = 30000): number {
    const now = Date.now();
    const history = this.priceHistory[symbol];
    const pastPrice = history.find(p => p.timestamp >= now - duration)?.price;
    const currentPrice = this.currentPrices[symbol];
    if (!pastPrice) return 0;
    return (currentPrice - pastPrice) / pastPrice;
  }

  // 断开连接
  disconnect() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.listeners = [];
  }

  // 设置波动率（用于测试）
  setVolatility(symbol: CryptoSymbol, volatility: number) {
    CRYPTO_CONFIG[symbol].volatility = volatility;
  }

  // 强制价格变动（用于测试）
  forcePriceChange(symbol: CryptoSymbol, percentChange: number) {
    this.currentPrices[symbol] = this.currentPrices[symbol] * (1 + percentChange);
    this.addPricePoint(symbol, this.currentPrices[symbol]);

    const priceData = this.buildPriceData();
    this.notifyListeners(priceData);
  }
}

// 导出单例实例
export const priceService = PriceService.getInstance();

// 导出便捷函数
export const getCurrentPrice = (symbol: CryptoSymbol = 'BTC') => priceService.getCurrentPrice(symbol);
export const subscribeToPrice = (callback: (data: PriceData) => void) => priceService.subscribe(callback);
export const switchCryptoSymbol = (symbol: CryptoSymbol) => priceService.switchSymbol(symbol);
