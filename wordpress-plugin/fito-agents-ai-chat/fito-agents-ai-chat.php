<?php
/**
 * Plugin Name:       Fito Agents AI Chat
 * Plugin URI:        https://fitoagents.com
 * Description:       Embed your Fito Agents AI website assistant on your WordPress site using your Agent ID.
 * Version:           1.0.0
 * Author:            Fito Technology, LLC
 * Author URI:        https://fitoagents.com
 * Text Domain:       fito-agents-ai-chat
 * License:           GPL-2.0+
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main Plugin Class
 */
class Fito_Agents_AI_Chat {

    public function __construct() {
        // Admin menu and settings
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );

        // Frontend script injection
        add_action( 'wp_footer', array( $this, 'inject_widget_script' ) );

        // Shortcode
        add_shortcode( 'fito_agent', array( $this, 'render_shortcode' ) );
    }

    /**
     * Add Menu to WordPress Admin
     */
    public function add_admin_menu() {
        add_menu_page(
            'Fito Agents',
            'Fito Agents',
            'manage_options',
            'fito-agents-settings',
            array( $this, 'render_settings_page' ),
            'dashicons-smart-toy',
            100
        );
    }

    /**
     * Register Plugin Settings
     */
    public function register_settings() {
        register_setting( 'fito_agents_options', 'fito_agent_id', array( 'sanitize_callback' => 'sanitize_text_field' ) );
        register_setting( 'fito_agents_options', 'fito_enabled', array( 'sanitize_callback' => 'absint' ) );
        register_setting( 'fito_agents_options', 'fito_position', array( 'sanitize_callback' => 'sanitize_text_field' ) );
        register_setting( 'fito_agents_options', 'fito_theme', array( 'sanitize_callback' => 'sanitize_text_field' ) );
        register_setting( 'fito_agents_options', 'fito_primary_color', array( 'sanitize_callback' => 'sanitize_text_field' ) );
        register_setting( 'fito_agents_options', 'fito_base_url', array( 'sanitize_callback' => 'esc_url_raw' ) );
        register_setting( 'fito_agents_options', 'fito_enable_on_all', array( 'sanitize_callback' => 'absint' ) );
        register_setting( 'fito_agents_options', 'fito_excluded_pages', array( 'sanitize_callback' => 'sanitize_text_field' ) );
    }

    /**
     * Enqueue Admin Assets
     */
    public function enqueue_admin_assets( $hook ) {
        if ( 'toplevel_page_fito-agents-settings' !== $hook ) {
            return;
        }
        wp_enqueue_style( 'fito-admin-style', plugins_url( 'assets/admin.css', __FILE__ ), array(), '1.0.0' );
        wp_enqueue_script( 'fito-admin-script', plugins_url( 'assets/admin.js', __FILE__ ), array( 'jquery' ), '1.0.0', true );
    }

    /**
     * Render the Settings Page
     */
    public function render_settings_page() {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        $agent_id = get_option( 'fito_agent_id' );
        $enabled = get_option( 'fito_enabled', 1 );
        $position = get_option( 'fito_position', 'bottom-right' );
        $theme = get_option( 'fito_theme', 'dark' );
        $color = get_option( 'fito_primary_color', '#0356ff' );
        $base_url = get_option( 'fito_base_url', 'https://fitoagents.com' );
        $enable_all = get_option( 'fito_enable_on_all', 1 );
        $excluded = get_option( 'fito_excluded_pages', '' );

        ?>
        <div class="wrap fito-admin-wrap">
            <div class="fito-header">
                <h1>Fito Agents AI Chat</h1>
                <p>Connect your custom AI assistant to your WordPress site in seconds.</p>
            </div>

            <div class="fito-main-grid">
                <div class="fito-settings-card">
                    <h2>Widget Settings</h2>
                    <form method="post" action="options.php">
                        <?php settings_fields( 'fito_agents_options' ); ?>
                        
                        <div class="fito-form-group">
                            <label for="fito_agent_id">Agent ID</label>
                            <input type="text" id="fito_agent_id" name="fito_agent_id" value="<?php echo esc_attr( $agent_id ); ?>" placeholder="e.g. agent_123456789" class="regular-text">
                            <p class="description">You can find this in your Fito Agents Dashboard under <strong>Embed & Share</strong>.</p>
                        </div>

                        <div class="fito-form-group">
                            <label class="fito-toggle">
                                <input type="checkbox" name="fito_enabled" value="1" <?php checked( $enabled, 1 ); ?>>
                                <span class="fito-slider"></span>
                                <span class="fito-toggle-label">Enable Widget</span>
                            </label>
                        </div>

                        <div class="fito-form-row">
                            <div class="fito-form-group">
                                <label for="fito_position">Position</label>
                                <select id="fito_position" name="fito_position">
                                    <option value="bottom-right" <?php selected( $position, 'bottom-right' ); ?>>Bottom Right</option>
                                    <option value="bottom-left" <?php selected( $position, 'bottom-left' ); ?>>Bottom Left</option>
                                </select>
                            </div>
                            <div class="fito-form-group">
                                <label for="fito_theme">Theme</label>
                                <select id="fito_theme" name="fito_theme">
                                    <option value="dark" <?php selected( $theme, 'dark' ); ?>>Dark (Default)</option>
                                    <option value="light" <?php selected( $theme, 'light' ); ?>>Light</option>
                                </select>
                            </div>
                        </div>

                        <div class="fito-form-group">
                            <label for="fito_primary_color">Primary Brand Color</label>
                            <input type="color" id="fito_primary_color" name="fito_primary_color" value="<?php echo esc_attr( $color ); ?>">
                        </div>

                        <hr>

                        <h3>Advanced Settings</h3>

                        <div class="fito-form-group">
                            <label for="fito_base_url">Fito Agents URL</label>
                            <input type="url" id="fito_base_url" name="fito_base_url" value="<?php echo esc_url( $base_url ); ?>" class="regular-text">
                            <p class="description">Default: <code>https://fitoagents.com</code></p>
                        </div>

                        <div class="fito-form-group">
                            <label class="fito-toggle">
                                <input type="checkbox" name="fito_enable_on_all" value="1" <?php checked( $enable_all, 1 ); ?>>
                                <span class="fito-slider"></span>
                                <span class="fito-toggle-label">Enable on all pages</span>
                            </label>
                        </div>

                        <div class="fito-form-group">
                            <label for="fito_excluded_pages">Exclude Pages (IDs/Slugs)</label>
                            <input type="text" id="fito_excluded_pages" name="fito_excluded_pages" value="<?php echo esc_attr( $excluded ); ?>" placeholder="cart, checkout, account" class="regular-text">
                            <p class="description">Comma-separated list of slugs or IDs where the widget should NOT appear.</p>
                        </div>

                        <?php submit_button( 'Save Widget Settings' ); ?>
                    </form>
                </div>

                <div class="fito-sidebar-cards">
                    <div class="fito-preview-card">
                        <h2>Embed Status</h2>
                        <div class="fito-status-box <?php echo ( $enabled && $agent_id ) ? 'active' : 'inactive'; ?>">
                            <span class="fito-dot"></span>
                            <?php echo ( $enabled && $agent_id ) ? 'Widget is Live' : 'Widget is Disabled'; ?>
                        </div>

                        <?php if ( $agent_id ) : ?>
                            <div class="fito-actions">
                                <a href="<?php echo esc_url( $base_url . '/widget/' . $agent_id ); ?>" target="_blank" class="button">Test Widget Page</a>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="fito-info-card">
                        <h2>How to Install</h2>
                        <ol>
                            <li>Log in to <a href="https://fitoagents.com/login" target="_blank">Fito Agents</a>.</li>
                            <li>Go to <strong>My Agents</strong> and select your agent.</li>
                            <li>Copy the <strong>Agent ID</strong> from the Embed & Share page.</li>
                            <li>Paste it here and click <strong>Save</strong>.</li>
                            <li>The AI chat will now appear on your site!</li>
                        </ol>
                    </div>

                    <div class="fito-shortcode-card">
                        <h2>Shortcode Support</h2>
                        <p>Want the agent to appear on a specific page only? Use the shortcode:</p>
                        <code>[fito_agent]</code>
                        <p>Or override settings:</p>
                        <code>[fito_agent id="ABC" color="#000"]</code>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Inject Widget Script into wp_footer
     */
    public function inject_widget_script() {
        if ( is_admin() ) {
            return;
        }

        $agent_id = get_option( 'fito_agent_id' );
        $enabled = get_option( 'fito_enabled', 1 );
        
        if ( ! $enabled || ! $agent_id ) {
            return;
        }

        // Visibility Check
        $enable_all = get_option( 'fito_enable_on_all', 1 );
        $excluded = get_option( 'fito_excluded_pages', '' );

        if ( ! $enable_all ) {
            // If not enabled on all, don't inject unless manually added via shortcode
            return;
        }

        if ( ! empty( $excluded ) ) {
            $excluded_array = array_map( 'trim', explode( ',', $excluded ) );
            if ( is_page( $excluded_array ) || is_single( $excluded_array ) ) {
                return;
            }
        }

        $this->print_script( $agent_id );
    }

    /**
     * Shortcode [fito_agent]
     */
    public function render_shortcode( $atts ) {
        $a = shortcode_atts( array(
            'id' => get_option( 'fito_agent_id' ),
            'position' => get_option( 'fito_position', 'bottom-right' ),
            'theme' => get_option( 'fito_theme', 'dark' ),
            'color' => get_option( 'fito_primary_color', '#0356ff' ),
        ), $atts );

        if ( empty( $a['id'] ) ) {
            return '<!-- Fito Agents: Missing Agent ID -->';
        }

        ob_start();
        $this->print_script( $a['id'], $a['position'], $a['theme'], $a['color'] );
        return ob_get_clean();
    }

    /**
     * Print the Embed Script
     */
    private function print_script( $agent_id, $pos = null, $theme = null, $color = null ) {
        $base_url = get_option( 'fito_base_url', 'https://fitoagents.com' );
        $pos = $pos ? $pos : get_option( 'fito_position', 'bottom-right' );
        $theme = $theme ? $theme : get_option( 'fito_theme', 'dark' );
        $color = $color ? $color : get_option( 'fito_primary_color', '#0356ff' );

        ?>
        <script 
            src="<?php echo esc_url( $base_url ); ?>/embed.js" 
            data-agent-id="<?php echo esc_attr( $agent_id ); ?>" 
            data-position="<?php echo esc_attr( $pos ); ?>" 
            data-primary-color="<?php echo esc_attr( $color ); ?>" 
            data-theme="<?php echo esc_attr( $theme ); ?>"
            async>
        </script>
        <?php
    }
}

// Initialize the plugin
new Fito_Agents_AI_Chat();
