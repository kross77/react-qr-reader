'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var Component = React.Component;

var PropTypes = require('prop-types');

var _require = require('./getDeviceId'),
    getDeviceId = _require.getDeviceId,
    getFacingModePattern = _require.getFacingModePattern;

var havePropsChanged = require('./havePropsChanged');
var createBlob = require('./createBlob');

// Require adapter to support older browser implementations
require('webrtc-adapter');

// Inline worker.js as a string value of workerBlob.
// eslint-disable-next-line
var workerBlob = createBlob([__inline('../lib/worker.js')], {
  type: 'application/javascript'
});

// Props that are allowed to change dynamicly
var propsKeys = ['delay', 'legacyMode', 'facingMode'];

module.exports = (_temp = _class = function (_Component) {
  _inherits(Reader, _Component);

  function Reader(props) {
    _classCallCheck(this, Reader);

    var _this = _possibleConstructorReturn(this, (Reader.__proto__ || Object.getPrototypeOf(Reader)).call(this, props));

    _this.els = {};


    _this.state = {
      mirrorVideo: false

      // Bind function to the class
    };_this.initiate = _this.initiate.bind(_this);
    _this.initiateLegacyMode = _this.initiateLegacyMode.bind(_this);
    _this.check = _this.check.bind(_this);
    _this.handleVideo = _this.handleVideo.bind(_this);
    _this.handleLoadStart = _this.handleLoadStart.bind(_this);
    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.clearComponent = _this.clearComponent.bind(_this);
    _this.handleReaderLoad = _this.handleReaderLoad.bind(_this);
    _this.openImageDialog = _this.openImageDialog.bind(_this);
    _this.handleWorkerMessage = _this.handleWorkerMessage.bind(_this);
    _this.setRefFactory = _this.setRefFactory.bind(_this);
    return _this;
  }

  _createClass(Reader, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Initiate web worker execute handler according to mode.
      this.worker = new Worker(URL.createObjectURL(workerBlob));
      this.worker.onmessage = this.handleWorkerMessage;

      if (!this.props.legacyMode) {
        this.initiate();
      } else {
        this.initiateLegacyMode();
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // React according to change in props
      var changedProps = havePropsChanged(this.props, nextProps, propsKeys);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = changedProps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var prop = _step.value;

          if (prop == 'facingMode') {
            this.clearComponent();
            this.initiate(nextProps);
            break;
          } else if (prop == 'delay') {
            if (this.props.delay == false && !nextProps.legacyMode) {
              this.timeout = setTimeout(this.check, nextProps.delay);
            }
            if (nextProps.delay == false) {
              clearTimeout(this.timeout);
            }
          } else if (prop == 'legacyMode') {
            if (this.props.legacyMode && !nextProps.legacyMode) {
              this.clearComponent();
              this.initiate(nextProps);
            } else {
              this.clearComponent();
              this.componentDidUpdate = this.initiateLegacyMode;
            }
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (nextState !== this.state) {
        return true;
      }

      // Only render when the `propsKeys` have changed.
      var changedProps = havePropsChanged(this.props, nextProps, propsKeys);
      return changedProps.length > 0;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // Stop web-worker and clear the component
      if (this.worker) {
        this.worker.terminate();
        this.worker = undefined;
      }
      this.clearComponent();
    }
  }, {
    key: 'clearComponent',
    value: function clearComponent() {
      // Remove all event listeners and variables
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = undefined;
      }
      if (this.stopCamera) {
        this.stopCamera();
      }
      if (this.reader) {
        this.reader.removeEventListener('load', this.handleReaderLoad);
      }
      if (this.els.img) {
        this.els.img.removeEventListener('load', this.check);
      }
    }
  }, {
    key: 'initiate',
    value: function initiate() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
      var onError = props.onError,
          facingMode = props.facingMode;

      // Check browser facingMode constraint support
      // Firefox ignores facingMode or deviceId constraints

      var isFirefox = /firefox/i.test(navigator.userAgent);
      var supported = {};
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getSupportedConstraints === 'function') {
        supported = navigator.mediaDevices.getSupportedConstraints();
      }
      var constraints = {};

      if (supported.facingMode) {
        constraints.facingMode = { ideal: facingMode };
      }
      if (supported.frameRate) {
        constraints.frameRate = { ideal: 25, min: 10 };
      }

      var vConstraintsPromise = supported.facingMode || isFirefox ? Promise.resolve(props.constraints || constraints) : getDeviceId(facingMode).then(function (deviceId) {
        return Object.assign({}, { deviceId: deviceId }, props.constraints);
      });

      vConstraintsPromise.then(function (video) {
        return navigator.mediaDevices.getUserMedia({ video: video });
      }).then(this.handleVideo).catch(onError);
    }
  }, {
    key: 'handleVideo',
    value: function handleVideo(stream) {
      var preview = this.els.preview;
      var facingMode = this.props.facingMode;

      // Preview element hasn't been rendered so wait for it.

      if (!preview) {
        return setTimeout(this.handleVideo, 200, stream);
      }

      // Handle different browser implementations of MediaStreams as src
      if ((preview || {}).srcObject !== undefined) {
        preview.srcObject = stream;
      } else if (preview.mozSrcObject !== undefined) {
        preview.mozSrcObject = stream;
      } else if (window.URL.createObjectURL) {
        preview.src = window.URL.createObjectURL(stream);
      } else if (window.webkitURL) {
        preview.src = window.webkitURL.createObjectURL(stream);
      } else {
        preview.src = stream;
      }

      // IOS play in fullscreen
      preview.playsInline = true;

      var streamTrack = stream.getTracks()[0];
      // Assign `stopCamera` so the track can be stopped once component is cleared
      this.stopCamera = streamTrack.stop.bind(streamTrack);

      preview.addEventListener('loadstart', this.handleLoadStart);

      this.setState({ mirrorVideo: facingMode == 'user', streamLabel: streamTrack.label });
    }
  }, {
    key: 'handleLoadStart',
    value: function handleLoadStart() {
      var _props = this.props,
          delay = _props.delay,
          onLoad = _props.onLoad;
      var _state = this.state,
          mirrorVideo = _state.mirrorVideo,
          streamLabel = _state.streamLabel;

      var preview = this.els.preview;
      preview.play();

      if (typeof onLoad == 'function') {
        onLoad({ mirrorVideo: mirrorVideo, streamLabel: streamLabel });
      }

      if (typeof delay == 'number') {
        this.timeout = setTimeout(this.check, delay);
      }

      // Some browsers call loadstart continuously
      preview.removeEventListener('loadstart', this.handleLoadStart);
    }
  }, {
    key: 'check',
    value: function check() {
      var _props2 = this.props,
          legacyMode = _props2.legacyMode,
          resolution = _props2.resolution,
          delay = _props2.delay;
      var _els = this.els,
          preview = _els.preview,
          canvas = _els.canvas,
          img = _els.img;

      // Get image/video dimensions

      var width = Math.floor(legacyMode ? img.naturalWidth : preview.videoWidth);
      var height = Math.floor(legacyMode ? img.naturalHeight : preview.videoHeight);

      // Canvas draw offsets
      var hozOffset = 0;
      var vertOffset = 0;

      // Scale image to correct resolution
      if (legacyMode) {
        // Keep image aspect ratio
        var greatestSize = width > height ? width : height;
        var ratio = resolution / greatestSize;

        height = ratio * height;
        width = ratio * width;

        canvas.width = width;
        canvas.height = height;
      } else {
        // Crop image to fit 1:1 aspect ratio
        var smallestSize = width < height ? width : height;
        var _ratio = resolution / smallestSize;

        height = _ratio * height;
        width = _ratio * width;

        vertOffset = (height - resolution) / 2 * -1;
        hozOffset = (width - resolution) / 2 * -1;

        canvas.width = resolution;
        canvas.height = resolution;
      }

      var previewIsPlaying = preview && preview.readyState === preview.HAVE_ENOUGH_DATA;

      if (legacyMode || previewIsPlaying) {
        var ctx = canvas.getContext('2d');

        ctx.drawImage(legacyMode ? img : preview, hozOffset, vertOffset, width, height);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Send data to web-worker
        this.worker.postMessage(imageData);
      } else {
        // Preview not ready -> check later
        this.timeout = setTimeout(this.check, delay);
      }
    }
  }, {
    key: 'handleWorkerMessage',
    value: function handleWorkerMessage(e) {
      var _props3 = this.props,
          onScan = _props3.onScan,
          legacyMode = _props3.legacyMode,
          delay = _props3.delay;

      var decoded = e.data;
      onScan(decoded || null);

      if (!legacyMode && typeof delay == 'number' && this.worker) {
        this.timeout = setTimeout(this.check, delay);
      }
    }
  }, {
    key: 'initiateLegacyMode',
    value: function initiateLegacyMode() {
      this.reader = new FileReader();
      this.reader.addEventListener('load', this.handleReaderLoad);
      this.els.img.addEventListener('load', this.check, false);

      // Reset componentDidUpdate
      this.componentDidUpdate = undefined;

      if (typeof this.props.onLoad == 'function') {
        this.props.onLoad();
      }
    }
  }, {
    key: 'handleInputChange',
    value: function handleInputChange(e) {
      var selectedImg = e.target.files[0];
      this.reader.readAsDataURL(selectedImg);
    }
  }, {
    key: 'handleReaderLoad',
    value: function handleReaderLoad(e) {
      // Set selected image blob as img source
      this.els.img.src = e.target.result;
    }
  }, {
    key: 'openImageDialog',
    value: function openImageDialog() {
      // Function to be executed by parent in user action context to trigger img file uploader
      this.els.input.click();
    }
  }, {
    key: 'setRefFactory',
    value: function setRefFactory(key) {
      var _this2 = this;

      return function (element) {
        _this2.els[key] = element;
      };
    }
  }, {
    key: 'render',
    value: function render() {
      var _props4 = this.props,
          style = _props4.style,
          className = _props4.className,
          onImageLoad = _props4.onImageLoad,
          legacyMode = _props4.legacyMode,
          showViewFinder = _props4.showViewFinder,
          facingMode = _props4.facingMode;


      var containerStyle = {
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        paddingTop: '100%'
      };
      var hiddenStyle = { display: 'none' };
      var previewStyle = {
        top: 0,
        left: 0,
        display: 'block',
        position: 'absolute',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      };
      var videoPreviewStyle = _extends({}, previewStyle, {
        objectFit: 'cover',
        transform: this.state.mirrorVideo ? 'scaleX(-1)' : undefined
      });
      var imgPreviewStyle = _extends({}, previewStyle, {
        objectFit: 'scale-down'
      });

      var viewFinderStyle = {
        top: 0,
        left: 0,
        zIndex: 1,
        boxSizing: 'border-box',
        border: '50px solid rgba(0, 0, 0, 0.3)',
        boxShadow: 'inset 0 0 0 5px rgba(255, 0, 0, 0.5)',
        position: 'absolute',
        width: '100%',
        height: '100%'
      };

      return React.createElement(
        'section',
        { className: className, style: style },
        React.createElement(
          'section',
          { style: containerStyle },
          !legacyMode && showViewFinder ? React.createElement('div', { style: viewFinderStyle }) : null,
          legacyMode ? React.createElement('input', {
            style: hiddenStyle,
            type: 'file',
            accept: 'image/*',
            ref: this.setRefFactory('input'),
            onChange: this.handleInputChange
          }) : null,
          legacyMode ? React.createElement('img', { style: imgPreviewStyle, ref: this.setRefFactory('img'), onLoad: onImageLoad }) : React.createElement('video', { style: videoPreviewStyle, ref: this.setRefFactory('preview') }),
          React.createElement('canvas', { style: hiddenStyle, ref: this.setRefFactory('canvas') })
        )
      );
    }
  }]);

  return Reader;
}(Component), _class.propTypes = {
  onScan: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onLoad: PropTypes.func,
  onImageLoad: PropTypes.func,
  delay: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  facingMode: PropTypes.oneOf(['user', 'environment']),
  legacyMode: PropTypes.bool,
  resolution: PropTypes.number,
  showViewFinder: PropTypes.bool,
  style: PropTypes.any,
  className: PropTypes.string,
  constraints: PropTypes.object
}, _class.defaultProps = {
  delay: 500,
  resolution: 600,
  facingMode: 'environment',
  showViewFinder: true,
  constraints: null
}, _temp);