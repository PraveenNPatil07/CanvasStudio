import { render, screen, fireEvent } from '@testing-library/react';
import Header from './components/Header';

describe('Header Component', () => {
  const defaultProps = {
    canvasDimensions: { width: 800, height: 600 },
    elementCount: 5,
    hasCanvas: true,
    toggleSidebar: jest.fn(),
    canvasTitle: 'My Design',
    onTitleChange: jest.fn(),
  };

  test('renders logo and title correctly', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Rocketium')).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Design')).toBeInTheDocument();
  });

  test('shows canvas metadata when canvas exists', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(/800 × 600 px/)).toBeInTheDocument();
    expect(screen.getByText(/5 elements/)).toBeInTheDocument();
  });

  test('hides metadata when canvas does not exist', () => {
    render(<Header {...defaultProps} hasCanvas={false} />);
    expect(screen.queryByText(/800 × 600 px/)).not.toBeInTheDocument();
  });

  test('calls onTitleChange when input changes', () => {
    render(<Header {...defaultProps} />);
    const input = screen.getByPlaceholderText('Untitled Design');
    fireEvent.change(input, { target: { value: 'New Name' } });
    expect(defaultProps.onTitleChange).toHaveBeenCalledWith('New Name');
  });

  test('sanitizes title input', () => {
    render(<Header {...defaultProps} />);
    const input = screen.getByPlaceholderText('Untitled Design');
    fireEvent.change(input, { target: { value: 'Invalid/Name' } });
    expect(defaultProps.onTitleChange).toHaveBeenCalledWith('InvalidName');
  });

  test('calls toggleSidebar when menu button clicked', () => {
    render(<Header {...defaultProps} />);
    const menuBtn = screen.getByRole('button', { name: '' }); // Menu icon button
    fireEvent.click(menuBtn);
    expect(defaultProps.toggleSidebar).toHaveBeenCalled();
  });
});
