<template>
  <div class="apply-page">
  <!-- 根据 shop_status 显示不同的内容 -->
  <div v-if="statusMessage" class="status-message">
    <p>{{ statusMessage }}</p>
  </div>

  <div v-else class="apply-container">
      <h2>店铺信息</h2>
      <form class="apply-form" @submit.prevent="handleSubmit">
        <!-- 店铺名称 -->
        <div class="form-group">
          <label for="shop_name">店铺名称</label>
          <input 
            type="text" 
            id="shop_name" 
            v-model="form.shop_name" 
            placeholder="请输入店铺名称"
            required
          />
        </div>

        <!-- 店铺描述 -->
        <div class="form-group">
          <label for="shop_description">店铺描述</label>
          <textarea 
            id="shop_description" 
            v-model="form.shop_description" 
            placeholder="请输入店铺描述"
            required
          ></textarea>
        </div>

        <!-- 特产地：省选择 -->
        <div class="form-group">
          <label for="location">特产地</label>
          <!-- 省级下拉列表 -->
          <select v-model="form.province" required>
            <option value="" disabled>请选择省</option>
            <option v-for="(cities, province) in provincesAndCities" :key="province" :value="province">{{ province }}</option>
          </select>
        </div>

        <!-- 食品经营许可证 -->
        <div class="form-group">
          <label for="pictures">食品经营许可证</label>
          <input 
            type="file" 
            id="pictures" 
            @change="handleFileUpload" 
            accept=".jpg,.jpeg,.png"
            required
          />
          
          <!-- 图片预览 -->
          <div class="image-preview" v-if="form.pictures">
            <p>上传的照片：</p>
            <div class="preview-container">
              <img :src="form.pictures.preview" alt="图片预览" class="preview-image" />
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <button type="submit" class="apply-btn">提交申请</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      user_id: 1,   // session的用户id，还没写
      statusMessage: '',
      form: {
        shop_name: '',
        shop_description: '',
        province: '',
        pictures: null // 存储上传的图片
      },
      provincesAndCities: {
        "北京市": ["北京市"],
        "天津市": ["天津市"],
        "河北省": ["石家庄", "唐山", "秦皇岛", "邯郸", "邢台", "保定", "张家口", "承德", "沧州", "廊坊", "衡水"],
        "山西省": ["太原", "大同", "阳泉", "长治", "晋城", "朔州", "晋中", "运城", "忻州", "临汾", "吕梁"],
        "内蒙古自治区": ["呼和浩特", "包头", "乌海", "赤峰", "通辽", "鄂尔多斯", "呼伦贝尔", "巴彦淖尔", "乌兰察布", "兴安盟", "锡林郭勒盟", "阿拉善盟"],
        "辽宁省": ["沈阳", "大连", "鞍山", "抚顺", "本溪", "丹东", "锦州", "营口", "阜新", "辽阳", "盘锦", "铁岭", "朝阳", "葫芦岛"],
        "吉林省": ["长春", "吉林市", "四平", "辽源", "通化", "白山", "松原", "白城", "延边朝鲜族自治州"],
        "黑龙江省": ["哈尔滨", "齐齐哈尔", "鸡西", "鹤岗", "双鸭山", "大庆", "伊春", "佳木斯", "七台河", "牡丹江", "黑河", "绥化", "大兴安岭"],
        "上海市": ["上海市"],
        "江苏省": ["南京", "无锡", "徐州", "常州", "苏州", "南通", "连云港", "淮安", "盐城", "扬州", "镇江", "泰州", "宿迁"],
        "浙江省": ["杭州", "宁波", "温州", "嘉兴", "湖州", "绍兴", "金华", "衢州", "舟山", "台州", "丽水"],
        "安徽省": ["合肥", "芜湖", "蚌埠", "淮南", "马鞍山", "淮北", "铜陵", "安庆", "黄山", "滁州", "阜阳", "宿州", "巢湖", "六安", "亳州", "池州", "宣城"],
        "福建省": ["福州", "厦门", "莆田", "三明", "泉州", "漳州", "南平", "龙岩", "宁德"],
        "江西省": ["南昌", "景德镇", "萍乡", "九江", "新余", "鹰潭", "赣州", "吉安", "宜春", "抚州", "上饶"],
        "山东省": ["济南", "青岛", "淄博", "枣庄", "东营", "烟台", "潍坊", "济宁", "泰安", "威海", "日照", "莱芜", "临沂", "德州", "聊城", "滨州", "菏泽"],
        "河南省": ["郑州", "开封", "洛阳", "平顶山", "安阳", "鹤壁", "新乡", "焦作", "濮阳", "许昌", "漯河", "三门峡", "南阳", "商丘", "信阳", "周口", "驻马店", "济源"],
        "湖北省": ["武汉", "黄石", "十堰", "宜昌", "襄阳", "鄂州", "荆门", "孝感", "荆州", "黄冈", "咸宁", "随州", "恩施土家族苗族自治州", "仙桃", "天门", "潜江", "神农架林区"],
        "湖南省": ["长沙", "株洲", "湘潭", "衡阳", "邵阳", "岳阳", "常德", "张家界", "益阳", "郴州", "永州", "怀化", "娄底", "湘西土家族苗族自治州"],
        "广东省": ["广州", "深圳", "珠海", "汕头", "韶关", "佛山", "江门", "湛江", "茂名", "肇庆", "惠州", "梅州", "汕尾", "河源", "阳江", "清远", "东莞", "中山", "揭阳", "云浮"],
        "广西壮族自治区": ["南宁", "柳州", "桂林", "梧州", "北海", "防城港", "钦州", "贵港", "玉林", "百色", "贺州", "河池", "来宾", "崇左"],
        "海南省": ["海口", "三亚", "五指山", "琼海", "儋州", "文昌", "万宁", "东方", "定安", "屯昌", "澄迈", "临高", "白沙黎族自治县", "昌江黎族自治县", "乐东黎族自治县", "陵水黎族自治县", "保亭黎族苗族自治县", "琼中黎族苗族自治县"],
        "重庆市": ["重庆市"],
        "四川省": ["成都", "自贡", "攀枝花", "泸州", "德阳", "绵阳", "广元", "遂宁市", "内江", "乐山", "南充", "眉山", "宜宾", "广安", "达州", "雅安", "巴中", "资阳", "阿坝藏族羌族自治州", "甘孜藏族自治州", "凉山彝族自治州"],
        "贵州省": ["贵阳", "六盘水", "遵义", "安顺", "铜仁", "毕节", "黔西南布依族苗族自治州", "黔东南苗族侗族自治州", "黔南布依族苗族自治州"],
        "云南省": ["昆明", "曲靖", "玉溪", "保山", "昭通", "丽江", "普洱", "临沧", "红河哈尼族彝族自治州", "文山壮族苗族自治州", "西双版纳傣族自治州", "楚雄彝族自治州", "大理白族自治州", "德宏傣族景颇族自治州", "怒江傈僳族自治州", "迪庆藏族自治州"],
        "西藏自治区": ["拉萨", "日喀则", "昌都", "林芝", "山南", "那曲", "阿里"],
        "陕西省": ["西安", "铜川", "宝鸡", "咸阳", "渭南", "延安", "汉中", "榆林", "安康", "商洛"],
        "甘肃省": ["兰州", "嘉峪关", "金昌", "白银", "天水", "武威", "张掖", "平凉", "酒泉", "庆阳", "定西", "陇南", "临夏回族自治州", "甘南藏族自治州"],
        "青海省": ["西宁", "海东", "海北藏族自治州", "黄南藏族自治州", "海南藏族自治州", "果洛藏族自治州", "玉树藏族自治州", "海西蒙古族藏族自治州"],
        "宁夏回族自治区": ["银川", "石嘴山", "吴忠", "固原", "中卫"],
        "新疆维吾尔自治区": ["乌鲁木齐", "克拉玛依", "吐鲁番", "哈密", "昌吉回族自治州", "博尔塔拉蒙古自治州", "巴音郭楞蒙古自治州", "阿克苏", "克孜勒苏柯尔克孜自治州", "喀什", "和田", "伊犁哈萨克自治州", "塔城", "阿勒泰"],
      }
    };
  },
  mounted() {
    this.checkShopStatus();
  },
  methods: {
    async checkShopStatus() {
      // 如果没有找到 user_id，则跳转到登录页面
      if (!this.user_id) {
        this.$router.push('/login'); // 使用 Vue Router 跳转到登录页面
      } else {
        // 如果 user_id 存在，则向后端查询 shop_status
        try {
          const response = await axios.post('http://localhost:8081/shop/checkStatus', {id:this.user_id});
          
          // 根据返回的 shop_status 设置状态消息
          if (response.data) {
            const status = response.data;
            if (status === 'waiting') {
              this.statusMessage = "您的申请已发送，请耐心等待审核结果！";
            } else {
              this.statusMessage = "您已成为商家，请前往【店铺管理】进行操作！";
            }
          } else {
            // 如果没有找到 shop_status，显示表单
            this.statusMessage = "";
          }
        } catch (error) {
          console.error('查询 shop_status 失败:', error);
        }
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];

      if (file) {
        const fileType = file.type;
        const fileSize = file.size;

        // 验证文件类型和大小
        if (['image/jpeg', 'image/png'].includes(fileType) && fileSize <= 20 * 1024 * 1024) { // 限制大小为5MB以内
          const reader = new FileReader();
          reader.onload = (e) => {
            this.form.pictures = {
              file: file,
              preview: e.target.result
            };
          };
          reader.readAsDataURL(file);
        } else {
          alert("只支持上传 jpg, jpeg, png 格式的图片，并且大小不能超过 20MB！");
        }
      }
    },
    async handleSubmit() {
      // 提交表单前先检查必要字段
      if (!this.form.shop_name || !this.form.shop_description || !this.form.province || !this.form.pictures) {
        alert('请填写所有必要的字段并上传图片');
        return;
      }

      // 准备表单数据
      const formData = new FormData();
      formData.append('shop_name', this.form.shop_name);
      formData.append('shop_description', this.form.shop_description);
      formData.append('province', this.form.province);

      // 追加图片数据
      formData.append('pictures', this.form.pictures.file);
      formData.append('user_id', this.user_id)

      try {
        // 发送 POST 请求到后端接口
        const response = await axios.post('http://localhost:8081/shop/apply', formData);

        if (response.status === 200) {
          alert('申请成功');
          // 提交后刷新页面
          window.location.reload(); // 刷新页面，重新加载该页面
        } else {
          alert('申请失败，请稍后再试');
        }
      } catch (error) {
        console.error('提交失败:', error);
        alert('发生错误，请稍后再试');
      }
    }
  }
};
</script>

<style scoped>
.apply-page {
  min-height: calc(100vh - 120px);
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.apply-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;

  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }
}

.apply-form {
  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
    }

    input,
    textarea,
    select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    select:disabled {
      background-color: #f5f5f5;
    }

    .image-preview {
      margin-top: 10px;

      .preview-container {
        display: flex;
        justify-content: center;

        .preview-image {
          width: 100px; /* 设置固定的宽度 */
          height: 100px; /* 设置固定的高度 */
          object-fit: cover; /* 保持图片比例，并填充容器 */
          border-radius: 4px;
        }
      }
    }
  }

  .apply-btn {
    width: 100%;
    padding: 12px;
    background-color: #ff6700;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
      background-color: #f85000;
    }
  }
}
</style>
