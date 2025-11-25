import './Logo.css';

function Logo({ size = 'medium', className = '' }) {
    const sizes = {
        small: 55,
        medium: 95,
        large: 135
    };

    const logoSize = sizes[size] || sizes.medium;

    return (
        <div className={`ghost-logo ${className}`} style={{ width: logoSize, height: logoSize }}>
            <img src="/ghost-logo6.png" alt="Doo Logo" />
        </div>
    );
}

export default Logo;
