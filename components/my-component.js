Component({

  externalClasses: ['my-component'],

  properties: {
    isShow: {
      type: Boolean,
      value: true,
    },
    buttonBorder: {
      type: String,
      value: "1px solid #eee"
    },
    backgroundColor: {
      type: String,
      value: "#fff"
    }
  },
  data: {
    keyNumber: '1234567890',
  },
  methods: {
    vehicleTap: function (event) {
      let val = event.target.dataset.value;
      var myEventOption = {}
      switch (val) {
        case 'delete':
          this.triggerEvent('delete');
          break;
        case 'ok':
          this.triggerEvent('ok');
          break;
        default:
          this.triggerEvent('inputchange', val);
      }
    },
  }
});