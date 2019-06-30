import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { stringGen } from '../../apps/Graph/libraries/SGLib/utils/stringUtils';
import { getTranslate } from 'react-localize-redux';
import { connect } from 'react-redux';

const styles = () => ({
  canvasContainer: {
    display: "grid",
    gridTemplateAreas:
      `"spacerTop"
       "loader"
       "spacerBottom"`,
    gridTemplateRows: "minmax(0, 1fr) auto minmax(0, 1fr)",
    gridTemplateColumns: "minmax(0, 1fr)",
  },
  canvas: {
    gridArea: 'loader',
  },
});

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.canvasContainer = React.createRef();

    this.state = {
      width: 0,
      height: 0,
      currentText: 'Loading...'
    };

    this.timer = null;
    this.offset = 0;

    this.canvasId = stringGen(10);
    this.ratio =  window.devicePixelRatio || 1;
  }

  componentWillMount() {
    window.addEventListener('resize', this.measureCanvas, false);
    this.drawRowOfRhombus();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.measureCanvas, false);
    window.cancelAnimationFrame(this.animation);
  }

  drawRowOfRhombus = () => {
    this.animation = requestAnimationFrame(this.drawRowOfRhombus);
    if (!this.canvas.current) {
      return;
    }

    const ctx = this.canvas.current.getContext('2d');
    ctx.save();
    ctx.scale(this.ratio, this.ratio);

    const width = this.state.width;
    const offset = this.offset;

    const rhombusHeight = 50;
    const rhombusWidth = 100;
    const numberOfRhombus = width / rhombusWidth + 2;
    const loadingTextLength = 12;

    this.offset = (offset - 1) % rhombusWidth;

    const starting = this.offset - rhombusWidth;

    ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);

    for (let i = 0; i < numberOfRhombus; i++) {
      Canvas.drawRhombus(
        ctx,
        starting + i * rhombusWidth,
        0,
        rhombusHeight,
        rhombusWidth
      );
    }

    if (this.props.loadingText) {
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.font = '20px monospace';
      ctx.fillStyle = 'white';
      if (!this.offset % 15) {
        const rand = Math.floor(Math.random() * loadingTextLength);
        this.setState({
          currentText: this.props.translate('loadingText_message' + rand)
        });
      }

      ctx.fillText(this.state.currentText, parseInt(`${width / 2}`), parseInt(`${rhombusHeight + 30}`));
    }

    ctx.restore();
  };

  static drawRhombus(context, xTop, yTop, rhombusHeight, rhombusWidth) {
    context.fillStyle = '#FF9800';
    context.beginPath();
    context.moveTo(xTop, yTop);
    context.lineTo(xTop + rhombusWidth / 2, yTop);
    context.lineTo(xTop + rhombusWidth, yTop + rhombusHeight);
    context.lineTo(xTop + rhombusWidth / 2, yTop + rhombusHeight);
    context.closePath();
    context.fill();
  }

  measureCanvas = () => {
    let rect = this.canvasContainer.current.getBoundingClientRect();
    if (this.state.width !== rect.width || this.state.height !== rect.height) {
      this.canvas.current.style.width = Math.round(rect.width) + 'px';
      this.canvas.current.style.height = (this.props.loadingText ? 100 : 50) + 'px';
      this.setState({
        width: rect.width,
        height: rect.height
      });
    }
  };

  componentDidMount() {
    this.measureCanvas();
  }

  componentDidUpdate() {
    this.measureCanvas();
  }

  render() {
    const { classes } = this.props;

    return (
        <div ref={this.canvasContainer} className={classes.canvasContainer}>
          <canvas
            className={classes.canvas}
            style={{ display: 'block' }}
            id={this.canvasId}
            ref={this.canvas}
            width={this.state.width * this.ratio}
            height={(this.props.loadingText ? 100 : 50) * this.ratio}
          />
        </div>
    );
  }
}

const mapStateToProps = state => ({
  translate: getTranslate(state.localize)
});

export default connect(mapStateToProps)(withStyles(styles)(Canvas));
