import React from 'react';
import { render, screen } from '@testing-library/react';
import { withSceneControl } from '../withSceneControl';

// Mock useSceneControl hook
jest.mock('../../hooks/useSceneControl', () => ({
  useSceneControl: () => ({
    containerRef: { current: null },
    controller: {
      play: jest.fn(),
      pause: jest.fn(),
      reset: jest.fn(),
      cleanup: jest.fn()
    },
    isPlaying: false
  })
}));

describe('withSceneControl', () => {
  // Test component
  const TestComponent: React.FC<any> = ({ id, controller, isPlaying }) => (
    <div data-testid="test-component">
      <span data-testid="id">{id}</span>
      <span data-testid="is-playing">{isPlaying.toString()}</span>
      <button onClick={() => controller.play()}>Play</button>
    </div>
  );

  const WrappedComponent = withSceneControl(TestComponent);

  it('should wrap component with scene container', () => {
    render(<WrappedComponent id="test-scene" />);
    
    const container = screen.getByTestId('test-component').parentElement;
    expect(container).toHaveClass('scene', 'scene-test-scene');
  });

  it('should pass props to wrapped component', () => {
    render(<WrappedComponent id="test-scene" customProp="test" />);
    
    expect(screen.getByTestId('id')).toHaveTextContent('test-scene');
  });

  it('should handle additional className', () => {
    render(<WrappedComponent id="test-scene" className="custom-class" />);
    
    const container = screen.getByTestId('test-component').parentElement;
    expect(container).toHaveClass('scene', 'scene-test-scene', 'custom-class');
  });

  it('should pass controller to wrapped component', () => {
    render(<WrappedComponent id="test-scene" />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should pass isPlaying state to wrapped component', () => {
    render(<WrappedComponent id="test-scene" />);
    
    expect(screen.getByTestId('is-playing')).toHaveTextContent('false');
  });
}); 