import { h, Component } from 'preact';
import Modal from './Modal';
import { AutoFocusInput } from './common';
import { commands, SWITCH_FILE_EVENT } from '../commands';

import { commandPaletteService } from '../commandPaletteService';
import { FileIcon } from './FileIcon';
import { UP_KEY, DOWN_KEY, ENTER_KEY } from '../keyboardKeys';

function getFolder(filePath) {
	const split = filePath.split('/');
	if (split.length > 1) {
		split.length = split.length - 1;
		return split.join('/');
	}
	return '';
}
function Row({ item, onClick, isSelected }) {
	return (
		<li>
			<button
				class={`command-palette__option-row ${
					isSelected ? 'command-palette__option-row--selected' : ''
				}`}
				onClick={onClick}
			>
				{item.path ? <FileIcon file={item} /> : null}
				{item.name}
				{item.path ? (
					<span class="command-palette__option-subtitle">
						{getFolder(item.path)}
					</span>
				) : null}
			</button>
		</li>
	);
}
export class CommandPalette extends Component {
	state = { list: [], search: '', selectedIndex: 0 };
	componentDidUpdate(previousProps) {
		if (this.props.show && !previousProps.show) {
			this.state.search = '';

			this.isCommandMode = this.props.isCommandMode;
			if (this.isCommandMode) {
				this.setState({ search: '>' });
			}

			this.setState({
				list: this.getFilteredList()
			});
		}
	}

	getFilteredList(search = '') {
		const list = this.isCommandMode ? commands : this.props.files;
		return list.filter(
			item =>
				item.name
					.toLowerCase()
					.indexOf(this.isCommandMode ? search.substr(1) : search) !== -1
		);
	}

	keyDownHandler(e) {
		const diff = { [UP_KEY]: -1, [DOWN_KEY]: 1 }[e.which];
		if (diff) {
			this.setState({
				selectedIndex:
					(this.state.selectedIndex + diff) % this.state.list.length
			});
			return;
		}
		if (e.which === ENTER_KEY) {
			this.selectOption(this.state.list[this.state.selectedIndex]);
		}
	}
	inputHandler(e) {
		const search = e.target.value;
		this.setState({ search });
		this.isCommandMode = search.indexOf('>') === 0;
		this.setState({
			list: this.getFilteredList(search),
			selectedIndex: 0
		});
	}
	optionClickHandler(option) {
		this.selectOption(option);
	}
	selectOption(option) {
		commandPaletteService.publish(
			option.path ? SWITCH_FILE_EVENT : option.event,
			option
		);
		this.props.closeHandler();
	}
	render() {
		return (
			<Modal
				show={this.props.show}
				closeHandler={this.props.closeHandler}
				noOverlay
				hideCloseButton
			>
				<AutoFocusInput
					type="search"
					placeholder="Search"
					value={this.state.search}
					onInput={this.inputHandler.bind(this)}
					onKeyUp={this.keyDownHandler.bind(this)}
				/>
				<ul style="padding:0;list-style:none;">
					{this.state.list.map((item, index) => (
						<Row
							isSelected={this.state.selectedIndex === index}
							item={item}
							onClick={this.optionClickHandler.bind(this, item)}
						/>
					))}
				</ul>
			</Modal>
		);
	}
}
